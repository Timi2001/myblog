// RSS Feed utilities and validation

export interface RSSItem {
  title: string;
  description: string;
  link: string;
  guid: string;
  pubDate: Date;
  author: string;
  category: string;
  content: string;
  enclosure?: {
    url: string;
    type: string;
    length: string;
  };
}

export interface RSSChannel {
  title: string;
  description: string;
  link: string;
  feedUrl: string;
  language: string;
  copyright: string;
  managingEditor: string;
  webMaster: string;
  items: RSSItem[];
}

// Escape XML special characters
export function escapeXml(str: string): string {
  if (!str) return '';
  return str
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;');
}

// Strip HTML tags
export function stripHtml(html: string): string {
  if (!html) return '';
  return html.replace(/<[^>]*>/g, '').trim();
}

// Truncate text to specified length
export function truncateText(text: string, maxLength: number = 200): string {
  if (!text || text.length <= maxLength) return text;
  return text.substring(0, maxLength).trim() + '...';
}

// Validate RSS feed structure
export function validateRSSFeed(channel: RSSChannel): { isValid: boolean; errors: string[] } {
  const errors: string[] = [];

  // Required channel elements
  if (!channel.title) errors.push('Channel title is required');
  if (!channel.description) errors.push('Channel description is required');
  if (!channel.link) errors.push('Channel link is required');

  // Validate URL format
  try {
    new URL(channel.link);
  } catch {
    errors.push('Channel link must be a valid URL');
  }

  try {
    new URL(channel.feedUrl);
  } catch {
    errors.push('Feed URL must be a valid URL');
  }

  // Validate language code
  if (channel.language && !/^[a-z]{2}(-[A-Z]{2})?$/.test(channel.language)) {
    errors.push('Language must be a valid language code (e.g., en-US)');
  }

  // Validate items
  channel.items.forEach((item, index) => {
    if (!item.title) errors.push(`Item ${index + 1}: title is required`);
    if (!item.description) errors.push(`Item ${index + 1}: description is required`);
    if (!item.link) errors.push(`Item ${index + 1}: link is required`);
    if (!item.guid) errors.push(`Item ${index + 1}: guid is required`);
    if (!item.pubDate) errors.push(`Item ${index + 1}: pubDate is required`);

    // Validate URLs
    try {
      new URL(item.link);
    } catch {
      errors.push(`Item ${index + 1}: link must be a valid URL`);
    }

    // Validate enclosure if present
    if (item.enclosure) {
      try {
        new URL(item.enclosure.url);
      } catch {
        errors.push(`Item ${index + 1}: enclosure URL must be valid`);
      }
      
      if (!item.enclosure.type) {
        errors.push(`Item ${index + 1}: enclosure type is required`);
      }
    }
  });

  return {
    isValid: errors.length === 0,
    errors
  };
}

// Generate RSS 2.0 XML
export function generateRSS20(channel: RSSChannel): string {
  const validation = validateRSSFeed(channel);
  if (!validation.isValid) {
    throw new Error(`Invalid RSS feed: ${validation.errors.join(', ')}`);
  }

  const lastBuildDate = new Date().toUTCString();
  const pubDate = channel.items.length > 0 ? channel.items[0].pubDate.toUTCString() : lastBuildDate;

  const rssItems = channel.items.map(item => `
    <item>
      <title><![CDATA[${item.title}]]></title>
      <description><![CDATA[${stripHtml(item.description)}]]></description>
      <link>${escapeXml(item.link)}</link>
      <guid isPermaLink="true">${escapeXml(item.guid)}</guid>
      <pubDate>${item.pubDate.toUTCString()}</pubDate>
      <author>${escapeXml(item.author)}</author>
      <category><![CDATA[${item.category}]]></category>
      <content:encoded><![CDATA[${item.content}]]></content:encoded>
      ${item.enclosure ? `<enclosure url="${escapeXml(item.enclosure.url)}" type="${item.enclosure.type}" length="${item.enclosure.length}" />` : ''}
    </item>`).join('');

  return `<?xml version="1.0" encoding="UTF-8"?>
<rss version="2.0" 
     xmlns:content="http://purl.org/rss/1.0/modules/content/"
     xmlns:wfw="http://wellformedweb.org/CommentAPI/"
     xmlns:dc="http://purl.org/dc/elements/1.1/"
     xmlns:atom="http://www.w3.org/2005/Atom"
     xmlns:sy="http://purl.org/rss/1.0/modules/syndication/"
     xmlns:slash="http://purl.org/rss/1.0/modules/slash/">
  <channel>
    <title><![CDATA[${channel.title}]]></title>
    <description><![CDATA[${channel.description}]]></description>
    <link>${escapeXml(channel.link)}</link>
    <atom:link href="${escapeXml(channel.feedUrl)}" rel="self" type="application/rss+xml" />
    <language>${channel.language}</language>
    <copyright><![CDATA[${channel.copyright}]]></copyright>
    <managingEditor>${escapeXml(channel.managingEditor)}</managingEditor>
    <webMaster>${escapeXml(channel.webMaster)}</webMaster>
    <pubDate>${pubDate}</pubDate>
    <lastBuildDate>${lastBuildDate}</lastBuildDate>
    <generator>Next.js Personal Blog RSS Generator</generator>
    <docs>https://www.rssboard.org/rss-specification</docs>
    <ttl>60</ttl>
    <image>
      <url>${escapeXml(channel.link)}/logo.png</url>
      <title><![CDATA[${channel.title}]]></title>
      <link>${escapeXml(channel.link)}</link>
      <width>144</width>
      <height>144</height>
      <description><![CDATA[${channel.description}]]></description>
    </image>
    ${rssItems}
  </channel>
</rss>`;
}

// Generate Atom 1.0 XML
export function generateAtom10(channel: RSSChannel): string {
  const validation = validateRSSFeed(channel);
  if (!validation.isValid) {
    throw new Error(`Invalid feed: ${validation.errors.join(', ')}`);
  }

  const updated = channel.items.length > 0 ? channel.items[0].pubDate : new Date();

  const atomEntries = channel.items.map(item => `
  <entry>
    <title type="html"><![CDATA[${item.title}]]></title>
    <link href="${escapeXml(item.link)}" />
    <id>${escapeXml(item.guid)}</id>
    <updated>${item.pubDate.toISOString()}</updated>
    <published>${item.pubDate.toISOString()}</published>
    <author>
      <name>${escapeXml(item.author)}</name>
    </author>
    <category term="${escapeXml(item.category)}" />
    <summary type="html"><![CDATA[${stripHtml(item.description)}]]></summary>
    <content type="html"><![CDATA[${item.content}]]></content>
    ${item.enclosure ? `<link rel="enclosure" type="${item.enclosure.type}" href="${escapeXml(item.enclosure.url)}" />` : ''}
  </entry>`).join('');

  return `<?xml version="1.0" encoding="UTF-8"?>
<feed xmlns="http://www.w3.org/2005/Atom">
  <title type="html"><![CDATA[${channel.title}]]></title>
  <subtitle type="html"><![CDATA[${channel.description}]]></subtitle>
  <link href="${escapeXml(channel.link)}" />
  <link href="${escapeXml(channel.feedUrl)}" rel="self" type="application/atom+xml" />
  <id>${escapeXml(channel.link)}</id>
  <updated>${updated.toISOString()}</updated>
  <author>
    <name>${escapeXml(channel.managingEditor)}</name>
  </author>
  <generator uri="https://nextjs.org/" version="14.0">Next.js Personal Blog</generator>
  <rights>${escapeXml(channel.copyright)}</rights>
  <icon>${escapeXml(channel.link)}/favicon.ico</icon>
  <logo>${escapeXml(channel.link)}/logo.png</logo>
  ${atomEntries}
</feed>`;
}

// Generate JSON Feed 1.1
export function generateJSONFeed(channel: RSSChannel): object {
  const validation = validateRSSFeed(channel);
  if (!validation.isValid) {
    throw new Error(`Invalid feed: ${validation.errors.join(', ')}`);
  }

  return {
    version: 'https://jsonfeed.org/version/1.1',
    title: channel.title,
    description: channel.description,
    home_page_url: channel.link,
    feed_url: channel.feedUrl,
    language: channel.language,
    icon: `${channel.link}/favicon.ico`,
    favicon: `${channel.link}/favicon.ico`,
    authors: [
      {
        name: channel.managingEditor,
        url: channel.link
      }
    ],
    items: channel.items.map(item => ({
      id: item.guid,
      url: item.link,
      title: item.title,
      summary: stripHtml(item.description),
      content_html: item.content,
      content_text: stripHtml(item.content),
      date_published: item.pubDate.toISOString(),
      date_modified: item.pubDate.toISOString(),
      authors: [
        {
          name: item.author
        }
      ],
      tags: [item.category],
      language: channel.language,
      ...(item.enclosure && {
        image: item.enclosure.url,
        banner_image: item.enclosure.url
      })
    }))
  };
}

// Feed discovery helpers
export function generateFeedDiscoveryTags(baseUrl: string, title: string): string {
  return `
    <!-- RSS Feed Discovery -->
    <link rel="alternate" type="application/rss+xml" title="${escapeXml(title)} RSS Feed" href="${baseUrl}/rss.xml" />
    <link rel="alternate" type="application/atom+xml" title="${escapeXml(title)} Atom Feed" href="${baseUrl}/atom.xml" />
    <link rel="alternate" type="application/feed+json" title="${escapeXml(title)} JSON Feed" href="${baseUrl}/feed.json" />
  `.trim();
}

// Validate feed URLs
export function validateFeedUrls(baseUrl: string): { isValid: boolean; errors: string[] } {
  const errors: string[] = [];

  try {
    new URL(baseUrl);
  } catch {
    errors.push('Base URL must be a valid URL');
  }

  // Check if URLs are accessible (this would be done server-side in a real implementation)
  const feedUrls = [
    `${baseUrl}/rss.xml`,
    `${baseUrl}/atom.xml`,
    `${baseUrl}/feed.json`
  ];

  feedUrls.forEach(url => {
    try {
      new URL(url);
    } catch {
      errors.push(`Invalid feed URL: ${url}`);
    }
  });

  return {
    isValid: errors.length === 0,
    errors
  };
}

// RSS feed statistics
export interface FeedStats {
  totalItems: number;
  averageContentLength: number;
  categoriesCount: number;
  oldestItem?: Date;
  newestItem?: Date;
  updateFrequency: string;
}

export function calculateFeedStats(items: RSSItem[]): FeedStats {
  if (items.length === 0) {
    return {
      totalItems: 0,
      averageContentLength: 0,
      categoriesCount: 0,
      updateFrequency: 'Unknown'
    };
  }

  const totalContentLength = items.reduce((sum, item) => sum + item.content.length, 0);
  const categories = new Set(items.map(item => item.category));
  const dates = items.map(item => item.pubDate).sort((a, b) => a.getTime() - b.getTime());
  
  // Calculate update frequency based on date differences
  let updateFrequency = 'Unknown';
  if (dates.length > 1) {
    const daysBetween = (dates[dates.length - 1].getTime() - dates[0].getTime()) / (1000 * 60 * 60 * 24);
    const averageDaysBetween = daysBetween / (dates.length - 1);
    
    if (averageDaysBetween <= 1) {
      updateFrequency = 'Daily';
    } else if (averageDaysBetween <= 7) {
      updateFrequency = 'Weekly';
    } else if (averageDaysBetween <= 30) {
      updateFrequency = 'Monthly';
    } else {
      updateFrequency = 'Irregular';
    }
  }

  return {
    totalItems: items.length,
    averageContentLength: Math.round(totalContentLength / items.length),
    categoriesCount: categories.size,
    oldestItem: dates[0],
    newestItem: dates[dates.length - 1],
    updateFrequency
  };
}