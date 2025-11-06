import { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'About',
  description: 'Learn more about me and this blog.',
};

export default function AboutPage() {
  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 py-12">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-lg p-8">
          {/* Header */}
          <div className="text-center mb-12">
            <h1 className="text-4xl font-bold text-gray-900 dark:text-white mb-4">
              About Me
            </h1>
            <p className="text-xl text-gray-600 dark:text-gray-300">
              Welcome to my personal blog where I share my thoughts, experiences, and insights.
            </p>
          </div>

          {/* Content */}
          <div className="prose prose-lg dark:prose-invert max-w-none">
            <p>
              Hello! I&apos;m passionate about sharing knowledge and experiences through writing. 
              This blog serves as a platform where I explore various topics that interest me 
              and hopefully provide value to my readers.
            </p>
            
            <h2>What You'll Find Here</h2>
            <p>
              On this blog, you'll discover articles covering a wide range of topics including:
            </p>
            <ul>
              <li>Technology and programming insights</li>
              <li>Personal experiences and lessons learned</li>
              <li>Industry trends and analysis</li>
              <li>Tips and tutorials</li>
              <li>Thoughts on various subjects that spark my curiosity</li>
            </ul>
            
            <h2>My Approach</h2>
            <p>
              I believe in creating content that is both informative and engaging. Each article 
              is crafted with care, aiming to provide practical value while maintaining an 
              authentic voice. Whether you&apos;re here to learn something new or simply enjoy 
              reading different perspectives, I hope you find something worthwhile.
            </p>
            
            <h2>Let's Connect</h2>
            <p>
              I love connecting with readers and fellow enthusiasts. Feel free to reach out 
              through the <a href="/contact" className="text-blue-600 hover:text-blue-800 dark:text-blue-400 dark:hover:text-blue-300">contact page</a> if you have questions, 
              suggestions, or just want to say hello. You can also subscribe to my newsletter 
              to stay updated with the latest posts.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}