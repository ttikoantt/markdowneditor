import { describe, it, expect, beforeEach } from 'vitest';
import { SearchEngine, type SearchDocument } from './searchEngine';

describe('SearchEngine', () => {
  let searchEngine: SearchEngine;

  const mockDocuments: SearchDocument[] = [
    {
      id: '1',
      path: '/docs/readme.md',
      name: 'readme.md',
      content: 'Welcome to the project. This is the README file.',
    },
    {
      id: '2',
      path: '/docs/guide.md',
      name: 'guide.md',
      content: 'This guide explains how to use the application.',
    },
    {
      id: '3',
      path: '/notes/todo.md',
      name: 'todo.md',
      content: 'TODO: Complete the documentation. Add more examples.',
    },
  ];

  beforeEach(() => {
    searchEngine = new SearchEngine();
    searchEngine.setDocuments(mockDocuments);
  });

  describe('search', () => {
    it('should return empty array for empty query', () => {
      const results = searchEngine.search('');
      expect(results).toHaveLength(0);
    });

    it('should return empty array for whitespace query', () => {
      const results = searchEngine.search('   ');
      expect(results).toHaveLength(0);
    });

    it('should find documents by content', () => {
      const results = searchEngine.search('README');
      expect(results.length).toBeGreaterThan(0);
      expect(results[0]?.fileName).toBe('readme.md');
    });

    it('should find documents by filename', () => {
      const results = searchEngine.search('guide');
      expect(results.length).toBeGreaterThan(0);
      expect(results[0]?.fileName).toBe('guide.md');
    });

    it('should respect limit option', () => {
      const results = searchEngine.search('the', { limit: 1 });
      expect(results).toHaveLength(1);
    });
  });

  describe('searchInFile', () => {
    it('should find matches in content', () => {
      const content = 'Line 1: Hello\nLine 2: World\nLine 3: Hello World';
      const matches = searchEngine.searchInFile('Hello', content);

      expect(matches).toHaveLength(2);
      expect(matches[0]?.line).toBe(1);
      expect(matches[1]?.line).toBe(3);
    });

    it('should return empty array for no matches', () => {
      const content = 'Some content here';
      const matches = searchEngine.searchInFile('xyz', content);

      expect(matches).toHaveLength(0);
    });

    it('should be case insensitive', () => {
      const content = 'Hello World';
      const matches = searchEngine.searchInFile('hello', content);

      expect(matches).toHaveLength(1);
    });

    it('should find multiple matches on same line', () => {
      const content = 'hello hello hello';
      const matches = searchEngine.searchInFile('hello', content);

      expect(matches).toHaveLength(3);
    });
  });

  describe('addDocument', () => {
    it('should add new document', () => {
      const newDoc: SearchDocument = {
        id: '4',
        path: '/new/file.md',
        name: 'file.md',
        content: 'New file content',
      };

      searchEngine.addDocument(newDoc);
      const results = searchEngine.search('New file');

      expect(results.length).toBeGreaterThan(0);
      expect(results[0]?.fileName).toBe('file.md');
    });

    it('should update existing document', () => {
      const updatedDoc: SearchDocument = {
        id: '1',
        path: '/docs/readme.md',
        name: 'readme.md',
        content: 'Updated content for README',
      };

      searchEngine.addDocument(updatedDoc);
      const results = searchEngine.search('Updated');

      expect(results.length).toBeGreaterThan(0);
      expect(results[0]?.fileName).toBe('readme.md');
    });
  });

  describe('removeDocument', () => {
    it('should remove document from search', () => {
      searchEngine.removeDocument('1');
      const results = searchEngine.search('README');

      expect(results).toHaveLength(0);
    });
  });

  describe('clear', () => {
    it('should remove all documents', () => {
      searchEngine.clear();
      const results = searchEngine.search('guide');

      expect(results).toHaveLength(0);
    });
  });
});
