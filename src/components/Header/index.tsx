import Link from 'next/link';
import Image from 'next/image';

import styles from './header.module.scss';

export default function Header() {
  return (
    <div className={styles.container}>
      <Link href="/">
        <a>
          <Image src={'/Logo.svg'} alt={'logo'} width={240} height={26} />
        </a>
      </Link>
    </div>
  );
}
