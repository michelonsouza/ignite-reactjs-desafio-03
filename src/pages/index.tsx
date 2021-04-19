import { useCallback, useState } from 'react';
import { GetStaticProps } from 'next';
import Head from 'next/head';
import Prismic from '@prismicio/client';
import { format, parseISO } from 'date-fns';
import ptBR from 'date-fns/locale/pt-BR';

import { getPrismicClient } from '../services/prismic';

import commonStyles from '../styles/common.module.scss';

import { Post as PostComponent } from './components/Post';

import styles from './home.module.scss';

export interface Post {
  uid?: string;
  first_publication_date: string | null;
  data: {
    title: string;
    subtitle: string;
    author: string;
  };
}

interface PostPagination {
  next_page: string;
  results: Post[];
}

interface HomeProps {
  postsPagination: PostPagination;
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
function dataFormatter(data: any, formatDate?: boolean): Post {
  return {
    uid: data.uid,
    first_publication_date: formatDate
      ? format(parseISO(data.first_publication_date), 'dd MMM yyyy', {
          locale: ptBR,
        })
      : data.first_publication_date,
    data: {
      title: data.data.title,
      subtitle: data.data.subtitle,
      author: data.data.author,
    },
  };
}

export default function Home({ postsPagination }: HomeProps): JSX.Element {
  const [posts, setPosts] = useState<Post[]>(
    postsPagination.results.map(post => ({
      ...post,
      first_publication_date: format(
        parseISO(post.first_publication_date),
        'dd MMM yyyy',
        {
          locale: ptBR,
        }
      ),
    }))
  );
  const [hasNextPage, setHasNextPage] = useState<string | null>(
    postsPagination.next_page
  );

  const handleGetMoreItems = useCallback(() => {
    if (hasNextPage) {
      fetch(hasNextPage)
        .then(res => res.json())
        .then(data => {
          setHasNextPage(data.next_page);
          setPosts(oldState => {
            return [
              ...oldState,
              ...data.results.map(item => dataFormatter(item, true)),
            ];
          });
        });
    }
  }, [hasNextPage]);

  return (
    <>
      <Head>
        <title>spacetraveling | Posts</title>
      </Head>
      <div className={[styles.homeContainer, commonStyles.container].join(' ')}>
        <img src="/images/logo.svg" alt="logo" />
        <div className={styles.postsContainer}>
          {posts.map(post => (
            <PostComponent post={post} key={post.uid} />
          ))}
        </div>

        {hasNextPage && (
          <button type="button" onClick={handleGetMoreItems}>
            Carregar mais posts
          </button>
        )}
      </div>
    </>
  );
}

export const getStaticProps: GetStaticProps = async () => {
  const prismic = getPrismicClient();
  const postsResponse = await prismic.query(
    [Prismic.Predicates.at('document.type', 'posts')],
    {
      fetch: ['post.title', 'post.subtitle', 'post.author'],
      pageSize: 1,
    }
  );

  const results = postsResponse.results.map(item => dataFormatter(item));

  return {
    props: {
      postsPagination: {
        results,
        next_page: postsResponse.next_page,
      },
    },
  };
};
