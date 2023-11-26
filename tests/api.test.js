const supertest = require('supertest')
const app = require('../app')
const mongoose = require('mongoose')
const Blog = require('../models/blog')

const api = supertest(app)


const initialList = [
    {
    _id: "5a422a851b54a676234d17f7",
    title: "React patterns",
    author: "Michael Chan",
    url: "https://reactpatterns.com/",
    likes: 7,
    __v: 0
    },
    {
    _id: "5a422aa71b54a676234d17f8",
    title: "Go To Statement Considered Harmful",
    author: "Edsger W. Dijkstra",
    url: "http://www.u.arizona.edu/~rubinson/copyright_violations/Go_To_Considered_Harmful.html",
    likes: 5,
    __v: 0
    },
    {
    _id: "5a422b3a1b54a676234d17f9",
    title: "Canonical string reduction",
    author: "Edsger W. Dijkstra",
    url: "http://www.cs.utexas.edu/~EWD/transcriptions/EWD08xx/EWD808.html",
    likes: 12,
    __v: 0
    },
    {
    _id: "5a422b891b54a676234d17fa",
    title: "First class tests",
    author: "Robert C. Martin",
    url: "http://blog.cleancoder.com/uncle-bob/2017/05/05/TestDefinitions.htmll",
    likes: 10,
    __v: 0
    },
    {
    _id: "5a422ba71b54a676234d17fb",
    title: "TDD harms architecture",
    author: "Robert C. Martin",
    url: "http://blog.cleancoder.com/uncle-bob/2017/03/03/TDD-Harms-Architecture.html",
    likes: 0,
    __v: 0
    },
    {
    _id: "5a422bc61b54a676234d17fc",
    title: "Type wars",
    author: "Robert C. Martin",
    url: "http://blog.cleancoder.com/uncle-bob/2016/05/01/TypeWars.html",
    likes: 2,
    __v: 0
    }  
]

beforeEach(async () => {
    await Blog.deleteMany({})
  
    const blogObjects = initialList
      .map(blog => new Blog(blog))
    
    const promiseArray = blogObjects.map(blog => blog.save())
    
    await Promise.all(promiseArray)
  })


describe('API Tests:', () => {

test('Blog list application returns the correct amount of blog posts', async () => {
    const response = await api.get('/api/blogs')
    expect(response.body).toHaveLength(initialList.length)
  })

  test('id is defiend', async () => {
    const response = await api.get('/api/blogs')
    expect(response.body[0].id).toBeDefined()
  })

  test('successful post method', async () => {
    const newBlog =  {
        _id: "5a422bc61b54a676234d17f1",
        title: "new post",
        author: "me",
        url: "fullwebDev",
        likes: 50,
        __v: 0
        }
  
    await api
      .post('/api/blogs')
      .send(newBlog)
      .expect(201)
      .expect('Content-Type', /application\/json/)
  
    const response = await api.get('/api/blogs')
    
    const titles = response.body.map(blog => blog.title)
    //console.log(titles)

    expect(response.body).toHaveLength(initialList.length + 1)
    expect(titles).toContain(
      'new post'
    )
  }, 20000)


  test('succeeds delete', async () => {
    const response = await api.get('/api/blogs')
    const blogToDelete = response.body[0]

    await api
      .delete(`/api/blogs/${blogToDelete.id}`)
      .expect(204)

    const afterDeleteResponse = await api.get('/api/blogs')

    expect(afterDeleteResponse.body).toHaveLength(
        initialList.length - 1
    )
  })

  test('succeeds update', async () => {
    const response = await api.get('/api/blogs')
    const blogToUpdate = response.body[0]
    blogToUpdate.likes = 51

    console.log(blogToUpdate)
    const updatedBlog = await api
      .put(`/api/blogs/${blogToUpdate.id}`)
      .send(blogToUpdate)
      .expect(200)
    //console.log(updatedBlog)//to fix
    expect(updatedBlog.body.likes).toBe(blogToUpdate.likes)
  })

})


afterAll(async () => {
  await mongoose.connection.close()
})