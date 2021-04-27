import { Document } from '@prismicio/client/types/documents';

export default function linkResolver(doc: Document): string {
  if (doc.type === 'posts') {
    return `/post/${doc.uid}`;
  }

  return '/';
}
