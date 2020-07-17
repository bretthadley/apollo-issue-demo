import React from 'react';
import { gql, useQuery } from '@apollo/client'

export const ALL_POSTS_QUERY = gql`
  query allPosts($first: Int!, $skip: Int!) {
    allPosts(orderBy: createdAt_DESC, first: $first, skip: $skip) {
      id
      title
      votes
      url
      createdAt
    }
    _allPostsMeta {
      count
    }
  }
`

export const allPostsQueryVars = {
  skip: 0,
  first: 10,
}

export default function Home() {
  const { loading, error, data } = useQuery(
    ALL_POSTS_QUERY,
    {
      variables: allPostsQueryVars
    }
  )

  if (error) return <div>Error!</div>
  if (loading) return <div>Loading</div>

  const { allPosts } = data

  return (
    <section>
      <ul>
        {allPosts.map((post, index) => (
          <li key={post.id}>
            <div>
              <span>{index + 1}. </span>
              <a href={post.url}>{post.title}</a>
            </div>
          </li>
        ))}
      </ul>
    </section>
  )
}
