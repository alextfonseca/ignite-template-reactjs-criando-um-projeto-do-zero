import { GetStaticPaths, GetStaticProps } from 'next';

import { getPrismicClient } from '../../services/prismic';

import commonStyles from '../../styles/common.module.scss';
import styles from './post.module.scss';

import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';

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

export default function Post({ post }: PostProps) {
  return (
    <>
      <div className={commonStyles.container}></div>

      {post.data.content.map(content => {
        return (
          <article>
            <h2>{content.heading}</h2>
          </article>
        );
      })}
    </>
  );
}

export const getStaticPaths = async () => {
  // const prismic = getPrismicClient();
  // const posts = await prismic.query(TODO);
  return {
    paths: [],
    fallback: true,
  };
};

// gera as paginas toda vez que a página de posts for acessada
export const getStaticProps: GetStaticProps = async ({ params }) => {
  // pegando o que foi digitado depois do /api/posts com params
  const { slug } = params;

  // carrehando o cliente do prismic
  const prismic = getPrismicClient();

  // pegando os dados do prismic pelo UID do post. Se não quiser passar configurações é só deixar um objeto vazio
  const response = await prismic.getByUID('posts', String(slug), {});

  console.log(response);

  const post = {
    first_publication_date: format(
      new Date(response.first_publication_date),
      'dd MMM yyyy',
      {
        locale: ptBR,
      }
    ),
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
