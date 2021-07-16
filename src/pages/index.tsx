import { AiOutlineCalendar } from 'react-icons/ai';
import { AiOutlineUser } from 'react-icons/ai';
import { GetStaticProps } from 'next';

import { getPrismicClient } from '../services/prismic';
import Prismic from '@prismicio/client';

import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';

import Link from 'next/link';
import { useState } from 'react';

import commonStyles from '../styles/common.module.scss';
import styles from './home.module.scss';

interface Post {
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

export default function Home({ postsPagination }: HomeProps): JSX.Element {
  const formattedPost = postsPagination.results.map(post => {
    return {
      ...post,
      first_publication_date: format(
        new Date(post.first_publication_date),
        'dd MMM yyyy',
        {
          locale: ptBR,
        }
      ),
    };
  });

  const [posts, setPosts] = useState<Post[]>(formattedPost);

  const [nextPage, setNextPage] = useState(postsPagination.next_page);

  async function handleMorePost() {
    if (nextPage != null) {
      await fetch(`${nextPage}`)
        .then(function (response) {
          return response.json();
        })
        .then(function (post) {
          var newPost = post.results.map(post => {
            return {
              uid: post.uid,
              first_publication_date: format(
                new Date(post.first_publication_date),
                'dd MMM yyyy',
                {
                  locale: ptBR,
                }
              ),
              data: {
                title: post.data.title,
                subtitle: post.data.subtitle,
                author: post.data.author,
              },
            };
          });

          setPosts([...posts, ...newPost]);
          setNextPage(post.next_page);
        });
    } else {
      return;
    }
  }

  return (
    <div className={commonStyles.container}>
      {posts.map(post => {
        return (
          <div className={styles.post} key={post.uid}>
            <Link href={`/post/${post.uid}`}>
              <a>
                <h1>{post.data.title}</h1>

                <p>{post.data.subtitle}</p>

                <div className={styles.infoPost}>
                  <div className={styles.dataPost}>
                    <AiOutlineCalendar />
                    <span>{post.first_publication_date}</span>
                  </div>

                  <div className={styles.authorPost}>
                    <AiOutlineUser />
                    <span>{post.data.author}</span>
                  </div>
                </div>
              </a>
            </Link>
          </div>
        );
      })}

      {nextPage && (
        <button className={styles.morePostsActive} onClick={handleMorePost}>
          Carregar mais posts
        </button>
      )}
    </div>
  );
}

export const getStaticProps: GetStaticProps = async () => {
  const prismic = getPrismicClient();
  const postsResponse = await prismic.query(
    [Prismic.predicates.at('document.type', 'posts')],
    {
      // o que queremos das publicações
      fetch: ['posts.title', 'posts.subtitle', 'posts.author'],

      // quantos posts você quer retornar
      pageSize: 1,
    }
  );

  const posts = postsResponse.results.map(post => {
    return {
      uid: post.uid,
      first_publication_date: post.first_publication_date,
      data: {
        title: post.data.title,
        subtitle: post.data.subtitle,
        author: post.data.author,
      },
    };
  });

  const postsPagination = {
    next_page: postsResponse.next_page,
    results: posts,
  };

  return {
    props: {
      postsPagination,
    },
  };
};
