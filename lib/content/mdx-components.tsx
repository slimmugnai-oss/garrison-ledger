/**
 * MDX COMPONENTS PROVIDER
 * 
 * Provides custom components for MDX rendering
 * Used for rendering Intel Cards with custom components
 */

import { Disclaimer, AsOf, DataRef, RateBadge } from '@/app/components/mdx';

/**
 * Custom MDX components
 * These override default HTML elements in MDX
 */
export function useMDXComponents(components: Record<string, any> = {}): Record<string, any> {
  return {
    // Custom Intel Card components
    Disclaimer,
    AsOf,
    DataRef,
    RateBadge,

    // Enhanced HTML elements
    h1: ({ children }: { children?: React.ReactNode }) => (
      <h1 className="text-4xl font-bold text-gray-900 mb-6 font-lora">
        {children}
      </h1>
    ),
    h2: ({ children }: { children?: React.ReactNode }) => (
      <h2 className="text-2xl font-semibold text-gray-900 mt-8 mb-4 font-lora">
        {children}
      </h2>
    ),
    h3: ({ children }: { children?: React.ReactNode }) => (
      <h3 className="text-xl font-semibold text-gray-900 mt-6 mb-3 font-lora">
        {children}
      </h3>
    ),
    h4: ({ children }: { children?: React.ReactNode }) => (
      <h4 className="text-lg font-semibold text-gray-900 mt-4 mb-2 font-lora">
        {children}
      </h4>
    ),
    p: ({ children }: { children?: React.ReactNode }) => (
      <p className="text-base text-gray-700 leading-relaxed mb-4">
        {children}
      </p>
    ),
    ul: ({ children }: { children?: React.ReactNode }) => (
      <ul className="list-disc list-inside space-y-2 mb-4 text-gray-700">
        {children}
      </ul>
    ),
    ol: ({ children }: { children?: React.ReactNode }) => (
      <ol className="list-decimal list-inside space-y-2 mb-4 text-gray-700">
        {children}
      </ol>
    ),
    li: ({ children }: { children?: React.ReactNode }) => (
      <li className="ml-4 text-gray-700">
        {children}
      </li>
    ),
    a: ({ href, children }: { href?: string; children?: React.ReactNode }) => (
      <a
        href={href}
        target="_blank"
        rel="noopener noreferrer"
        className="text-blue-600 hover:text-blue-700 hover:underline font-medium"
      >
        {children}
      </a>
    ),
    blockquote: ({ children }: { children?: React.ReactNode }) => (
      <blockquote className="border-l-4 border-blue-500 pl-4 py-2 my-4 bg-blue-50 text-gray-700 italic">
        {children}
      </blockquote>
    ),
    code: ({ children }: { children?: React.ReactNode }) => (
      <code className="bg-gray-100 text-gray-800 px-1.5 py-0.5 rounded text-sm font-mono">
        {children}
      </code>
    ),
    pre: ({ children }: { children?: React.ReactNode }) => (
      <pre className="bg-gray-900 text-gray-100 p-4 rounded-lg overflow-x-auto my-4">
        {children}
      </pre>
    ),
    hr: () => (
      <hr className="border-gray-200 my-8" />
    ),
    table: ({ children }: { children?: React.ReactNode }) => (
      <div className="overflow-x-auto my-6">
        <table className="min-w-full divide-y divide-gray-200 border border-gray-200">
          {children}
        </table>
      </div>
    ),
    thead: ({ children }: { children?: React.ReactNode }) => (
      <thead className="bg-gray-50">
        {children}
      </thead>
    ),
    tbody: ({ children }: { children?: React.ReactNode }) => (
      <tbody className="bg-white divide-y divide-gray-200">
        {children}
      </tbody>
    ),
    tr: ({ children }: { children?: React.ReactNode }) => (
      <tr>
        {children}
      </tr>
    ),
    th: ({ children }: { children?: React.ReactNode }) => (
      <th className="px-4 py-3 text-left text-xs font-medium text-gray-700 uppercase tracking-wider">
        {children}
      </th>
    ),
    td: ({ children }: { children?: React.ReactNode }) => (
      <td className="px-4 py-3 text-sm text-gray-700">
        {children}
      </td>
    ),

    // Merge with any custom components passed in
    ...components,
  };
}

export default useMDXComponents;

