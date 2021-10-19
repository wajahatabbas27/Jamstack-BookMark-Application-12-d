const { ApolloServer, gql } = require("apollo-server-lambda")
const faunadb = require("faunadb")
const dotenv = require("dotenv")
const q = faunadb.query

dotenv.config()

const typeDefs = gql`
  type Query {
    bookmark: [Bookmark!]
  }
  type Bookmark {
    id: ID!
    url: String!
    desc: String!
  }
  type Mutation {
    addBookmark(url: String!, desc: String!): Bookmark
  }
`

const authors = [
  {
    id: 1,
    url: "https://github.com/daniyalnagori/bookmarking-app/blob/master/gatsby-browser.js",
    desc: "daniyal nagori repo",
  },
  {
    id: 2,
    url: "https://dashboard.fauna.com/db/global/bookmarks",
    desc: "fauna-db dashboard",
  },
  {
    id: 3,
    url: "https://www.youtube.com/watch?v=FPH7NYrdBgY&t=912s",
    desc: "bootcamp class project 12-d",
  },
]

const resolvers = {
  Query: {
    bookmark: async (root, args, context) => {
      try {
        const client = new faunadb.Client({
          secret: process.env.FAUNA_DB_SECRET,
        })
        //getting data from faunadb
        const result = await client.query(
          q.Map(
            q.Paginate(q.Match(q.Index("url"))),
            q.Lambda(x => q.Get(x))
          )
        )
        return result.data.map(d => {
          return {
            id: d.ts,
            url: d.data.url,
            desc: d.data.desc,
          }
        })
      } catch (error) {
        console.log("error", error)
      }
    },
  },
  Mutation: {
    addBookmark: async (_, { url, desc }) => {
      try {
        const client = new faunadb.Client({
          secret: process.env.FAUNA_DB_SECRET,
        })
        var result = await client.query(
          q.Create(q.Collection("links"), {
            data: {
              url,
              desc,
            },
          })
        )
        console.log(
          "Document Created and Inserted in Container: " + result.ref.id
        )
        //console.log("url :", url, "desc :", desc)

        return result.ref.data
      } catch (error) {
        console.log("Error: ")
        console.log(error)
      }
    },
  },
}

const server = new ApolloServer({
  typeDefs,
  resolvers,
})

const handler = server.createHandler()

module.exports = { handler }
