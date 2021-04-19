import Link from 'next/link';

import globalClasses from '../../styles/common.module.scss';

import classes from './header.module.scss';

export default function Header(): JSX.Element {
  return (
    <header className={classes.header}>
      <div
        className={[globalClasses.container, classes.headerContent].join(' ')}
      >
        <Link href="/">
          <a>
            <img src="/images/logo.svg" alt="logo" />
          </a>
        </Link>
      </div>
    </header>
  );
}
