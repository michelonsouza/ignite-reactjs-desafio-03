/* eslint-disable react/no-danger */
import { useMemo } from 'react';
import { GetStaticPaths, GetStaticProps } from 'next';
import Head from 'next/head';
import { useRouter } from 'next/router';
import Prismic from '@prismicio/client';
import { RichText } from 'prismic-dom';
import { format, parseISO } from 'date-fns';
import ptBR from 'date-fns/locale/pt-BR';
import { FiUser, FiCalendar, FiClock } from 'react-icons/fi';

import { getPrismicClient } from '../../services/prismic';
import Header from '../../components/Header';

import commonStyles from '../../styles/common.module.scss';
import styles from './post.module.scss';

interface Post {
  first_publication_date: string | null;
  last_publication_date: string | null;
  slugs?: string[];
  data: {
    title: string;
    banner: {
      url: string;
    };
    author: string;
    content: {
      heading: string;
      body: {
        text: string;
      }[];
    }[];
  };
}

interface PostProps {
  post: Post;
}

export default function Post({ post }: PostProps): JSX.Element {
  const router = useRouter();

  const postDate = useMemo(() => {
    if (post?.first_publication_date) {
      return format(parseISO(post.first_publication_date), 'dd MMM yyyy', {
        locale: ptBR,
      });
    }

    return '';
  }, [post?.first_publication_date]);

  const time = useMemo(() => {
    if (post?.data.content) {
      const words = post.data.content.reduce(
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        (accumulator: number, item: any) => {
          const headingQuantity: number = item.heading.split(' ').length;
          const bodyQuantity: number = RichText.asText(item.body).split(' ')
            .length;

          return accumulator + headingQuantity + bodyQuantity;
        },
        0
      );

      return `${Math.ceil(words / 200)} min`;
    }

    return '';
  }, [post?.data.content]);

  const lastEdit = useMemo(() => {
    if (post?.last_publication_date) {
      return format(
        parseISO(post.last_publication_date),
        "'* editado em' dd MMM yyyy, 'às' HH:mm",
        {
          locale: ptBR,
        }
      );
    }

    return '';
  }, [post?.last_publication_date]);

  if (router.isFallback) {
    return <h1>Carregando...</h1>;
  }

  return (
    <>
      <Head>
        <title>spacetraveling | {post.data.title}</title>
      </Head>
      <Header />
      <div
        className={styles.banner}
        style={{ backgroundImage: `url(${post.data.banner.url})` }}
      />
      <div className={commonStyles.container}>
        <header className={styles.postHeader}>
          <h1>{post.data.title}</h1>
          <div className={commonStyles.postInfosContainer}>
            <div>
              <FiCalendar />
              <span>{postDate}</span>
            </div>
            <div>
              <FiUser />
              <span>{post.data.author}</span>
            </div>
            <div>
              <FiClock />
              <span className={styles.lowerCase}>{time}</span>
            </div>
          </div>
          <div className={commonStyles.postInfosContainer}>
            <div>
              <span className={styles.lowerCase}>
                <em>{lastEdit}</em>
              </span>
            </div>
          </div>
        </header>

        <div className={styles.contentContainer}>
          {post.data.content.map((content, index) => (
            <div key={`post-content-${index + 1}`}>
              <h2>{content.heading}</h2>
              {content.body.map((bodyContent, bodyIndex) => (
                <p key={`body-content-${bodyIndex + 1}`}>{bodyContent.text}</p>
              ))}
            </div>
          ))}
        </div>
        <div
          ref={element => {
            if (!element || element.childNodes.length) {
              return;
            }

            const script = document.createElement('script');
            script.setAttribute('id', 'utteranc-comments');
            script.setAttribute('src', 'https://utteranc.es/client.js');
            script.setAttribute('crossorigin', 'anonymous');
            script.setAttribute('async', 'true');
            script.setAttribute(
              'repo',
              'michelonsouza/ignite-reactjs-desafio-03'
            );
            script.setAttribute(
              'issue-term',
              `${post.slugs ? post.slugs[0] : 'pathname'}`
            );
            script.setAttribute('theme', 'dark-blue');
            element.appendChild(script);
          }}
        />
      </div>
    </>
  );
}

export const getStaticPaths: GetStaticPaths = async () => {
  const prismic = getPrismicClient();
  const posts = await prismic.query(
    [Prismic.Predicates.at('document.type', 'posts')],
    {
      fetch: [],
      pageSize: 1,
    }
  );

  return {
    paths: posts.results.map(post => ({
      params: { slug: post.uid },
    })),
    fallback: true,
  };
};

export const getStaticProps: GetStaticProps = async ({ params }) => {
  const { slug } = params;

  const prismic = getPrismicClient();
  const response = await prismic.getByUID('posts', String(slug), {});

  return {
    props: {
      post: response,
    },
  };
};
