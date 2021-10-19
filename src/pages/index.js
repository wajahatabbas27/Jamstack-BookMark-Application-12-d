import React from "react"
import { useQuery, useMutation } from "@apollo/client"
import gql from "graphql-tag"

const BOOKMARK_QUERY = gql`
  {
    bookmark {
      id
      url
      desc
    }
  }
`

//mutations
const ADD_BOOKMARK_MUTATION = gql`
  mutation addBookmark($url: String!, $desc: String!) {
    addBookmark(url: $url, desc: $desc) {
      url
    }
  }
`

const Index = () => {
  let textfield
  let desc
  const { loading, error, data } = useQuery(BOOKMARK_QUERY)
  const [addBookmark] = useMutation(ADD_BOOKMARK_MUTATION)
  //console.log(data)
  const addBookmarkSubmit = () => {
    addBookmark({
      variables: {
        url: textfield.value,
        desc: desc.value,
      },
      //refetching data using mutation provided by graphql
      refetchQueries: [{ query: BOOKMARK_QUERY }],
    })
    console.log("textfield :", textfield.value, "desc :", desc.value)
  }
  return (
    <div>
      <p>{JSON.stringify(data)}</p>
      <div>
        <input type="text" placeholder="URL" ref={node => (textfield = node)} />
        <input
          type="text"
          placeholder="description"
          ref={node => (desc = node)}
        />
        <button onClick={addBookmarkSubmit}>Add Bookmark</button>
      </div>
    </div>
  )
}

export default Index
