import Link from 'next/link';
import { FiUser, FiCalendar } from 'react-icons/fi';

import classes from './styles.module.scss';

import { Post as PostType } from '../..';

interface PostProps {
  post: PostType;
}

export function Post({ post }: PostProps): JSX.Element {
  return (
    <div className={classes.postContainer}>
      <Link href={`/post/${post.uid}`}>
        <a title={post.data.title}>
          <h3 className={classes.title}>{post.data.title}</h3>
        </a>
      </Link>
      <p>{post.data.subtitle}</p>
      <div className={classes.postInfosContainer}>
        <div>
          <FiCalendar />
          <span>{post.first_publication_date}</span>
        </div>
        <div>
          <FiUser />
          <span>{post.data.author}</span>
        </div>
      </div>
    </div>
  );
}
