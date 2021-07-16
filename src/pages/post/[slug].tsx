import { AiOutlineCalendar } from 'react-icons/ai';
import { AiOutlineUser } from 'react-icons/ai';
import { AiFillClockCircle } from 'react-icons/ai';

import { getPrismicClient } from '../../services/prismic';
import Prismic from '@prismicio/client';

import { GetStaticPaths, GetStaticProps } from 'next';

import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import { RichText } from 'prismic-dom';

import commonStyles from '../../styles/common.module.scss';
import styles from './post.module.scss';
import { useRouter } from 'next/router';

interface Post {
  first_publication_date: string | null;
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

  if (router.isFallback) {
    return <h1>Carregando...</h1>;
  }

  const formattedDate = format(
    new Date(post.first_publication_date),
    'dd MMM yyyy',
    {
      locale: ptBR,
    }
  );

  const totalWords = post.data.content.reduce((total, contentItem) => {
    total += contentItem.heading.split(' ').length;

    const words = contentItem.body.map(item => item.text.split(' ').length);
    words.map(word => (total += word));
    return total;
  }, 0);

  const readTime = Math.ceil(totalWords / 200);

  return (
    <>
      <img
        className={styles.banner}
        src={post.data.banner.url}
        alt={post.data.title}
      />
      <div className={commonStyles.container}>
        <div className={styles.header}>
          <h1>{post.data.title}</h1>
          <div className={styles.infoPost}>
            <div className={styles.date}>
              <AiOutlineCalendar />
              {formattedDate}
            </div>
            <div className={styles.author}>
              <AiOutlineUser />
              {post.data.author}
            </div>
            <div className={styles.readTime}>
              <AiFillClockCircle />
              <span> {`${readTime} min`}</span>
            </div>
          </div>
        </div>

        {post.data.content.map(content => {
          return (
            <article className={styles.contentPost} key={content.heading}>
              <h2>{content.heading}</h2>
              <div
                className={styles.content}
                dangerouslySetInnerHTML={{
                  __html: RichText.asHtml(content.body),
                }}
              />
            </article>
          );
        })}
      </div>
    </>
  );
}

export const getStaticPaths: GetStaticPaths = async () => {
  const prismic = getPrismicClient();
  const posts = await prismic.query([
    Prismic.Predicates.at('document.type', 'posts'),
  ]);

  const paths = posts.results.map(post => {
    return {
      params: {
        slug: post.uid,
      },
    };
  });

  return {
    paths: paths,
    fallback: true,
  };
};

export const getStaticProps: GetStaticProps = async ({ params }) => {
  const { slug } = params;

  const prismic = getPrismicClient();

  const response = await prismic.getByUID('posts', String(slug), {});

  const post = {
    first_publication_date: response.first_publication_date,
    data: {
      title: response.data.title,
      banner: {
        url: response.data.banner.url,
      },
      author: response.data.author,
      content: response.data.content.map(content => {
        return {
          heading: content.heading,
          body: [...content.body],
        };
      }),
    },
  };

  return {
    props: { post },

    revalidate: 60 * 30, //30 minutos
  };
};
