import React from 'react';
import { gql, useQuery } from '@apollo/client'
import styled from '@emotion/styled';

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

const Container = styled.section`
  padding: 24px;
`

const List = styled.ul`
  margin: 0;
  padding: 0;
`

const ListItem = styled.li`
  display: block;
  margin-bottom: 10px;
`

const PostContainer = styled.div`
  display: flex;
`;

const Counter = styled.span`
  font-size: 16px;
  marign-right: 6px;
`;

const PostLink = styled.a`
  font-size: 20px;
  color: green;
  margin-right: 10px;
  text-decoration: none;
  padding-bottom: 0;
  border: 0;
`

const Loading = styled.div`
  font-size: 60px;
  color: orange;
`

const Error = styled.div`
  font-size: 60px;
  color: red;
`

const RandomBoxContainer = styled.div`
  display: flex;
  flex-direction: row;
  flex-wrap: wrap;
`
const RandomStyledBox = styled.div`
  width: 50px;
  height: 50px;
  margin: 2px;
  background-color: ${props => props.index % 2 === 0 ? '#bbb' : '#aaa'}
`

export default function Home() {
  const { loading, error, data } = useQuery(
    ALL_POSTS_QUERY,
    {
      variables: allPostsQueryVars
    }
  )

  if (error) return <div>Error!</div>
  if (loading) return <Loading>Loading</Loading>

  const { allPosts } = data

  return (
    <Container>
      <List>
        {allPosts.map((post, index) => (
          <ListItem key={post.id}>
            <PostContainer>
              <Counter>{index + 1}. </Counter>
              <PostLink href={post.url}>{post.title}</PostLink>
            </PostContainer>
          </ListItem>
        ))}
      </List>
      <RandomBoxContainer>
        {[...Array(1000)].map((_, i) => {
          return <RandomStyledBox key={i} index={i} />
        })}
      </RandomBoxContainer>
    </Container>
  )
}
