# Social Postify Backend
“Social Postify” is a web application that allows users to create and schedule posts for various social networks, such as Facebook, Instagram, Twitter and LinkedIn. The system supports scheduling of multiple posts and provides a clear overview of scheduled posts.

## About
This backend project is aimed at providing users with enhanced management capabilities for their posts across various social media platforms. Our RESTful API empowers users to efficiently oversee and optimize their social media content.

## Endpoints
<details>
  <summary>Health Check</summary>
  <ul>
  <li>Health response</li>
  <details>
    <summary>(GET "/health")</summary>
  
  ```javascript
// response
  "I'm okay!"
  ```
  </details>
</ul>
</details>
<br/>

<details>
  <summary>Medias endpoints</summary>
<br/>
  <ul>
    <li>Create Media</li>
<details>
  <summary>
  (POST "medias")
  </summary>
  <ul>
    <li>
      Creates new media
    </li>
    <li>
      Should not have registration with the same combination of title and username
    </li>
  </ul>
    
  ```javascript
  // body
{
	"title": "Instagram",
	"username": "myusername",
}
  ```
</details>
<br/>
<li>Get all medias</li>
<details>
  <summary>
  (GET "medias")
  </summary>
  <ul>
    <li>
      Response with all medias registred
    </li>
  </ul>
  
  ```javascript
  // response
 [
	{
		"id": 1,
		"title": "Instagram",
		"username": "myusername", //
	},
	{
		"id": 2,
		"title": "Twitter",
		"username": "myusername",
	}
]
  ```
</details>
<br/>
<li>Get specific media</li>
<details>
  <summary>
  (GET "medias/:id")
  </summary>
  <ul>
    <li>
      Response with one media that has the specificated id.
    </li>
  </ul>
  
  ```javascript
  // response
 
[
	{
		"id": 1,
		"title": "Instagram",
		"username": "myusername",
	}
]

  ```
</details>
</ul>
</details>
<br/>

<details>
  <summary>Posts endpoints</summary>
<br/>
  <ul>
    <li>Create post</li>
<details>
  <summary>
  (POST "posts")
  </summary>
  <ul>
    <li>
      Creates new post
    </li>
  </ul>
    
  ```javascript
  // body
{
  "title": "Why you should have a guinea pig?",
  "text": "https://www.guineapigs.com/why-you-should-guinea",
}
  ```
</details>
<br/>
<li>Get all posts</li>
<details>
  <summary>
  (GET "posts")
  </summary>
  <ul>
    <li>
      Response with all posts registred
    </li>
  </ul>
  
  ```javascript
  // response
[
	{
		"id": 1
		"title": "Why you should have a guinea pig?",
		"text": "https://www.guineapigs.com/why-you-should-guinea",
	},
	{
		"id": 2,
		"title": "Man dies after coding for 400 hours no stop",
		"text": "https://www.devnews.com/dies-after-400",
		"image": "https://www.devnews.com/dead-dev.jpg"
	}
]
  ```
</details>
<br/>
<li>Get specific post</li>
<details>
  <summary>
  (GET "posts/:id")
  </summary>
  <ul>
    <li>
      Response with one post that has the specificated id.
    </li>
  </ul>
  
  ```javascript
  // response
 
[
	{
		"id": 1
		"title": "Why you should have a guinea pig?",
		"text": "https://www.guineapigs.com/why-you-should-guinea",
	},
]

  ```
</details>
</ul>
</details>
<br/>

<details>
  <summary>Publications endpoints</summary>
<br/>
  <ul>
    <li>Create publication</li>
<details>
  <summary>
  (POST "publications")
  </summary>
  <ul>
    <li>
      Creates new publication associated with a media and a post
    </li>
    <li>
      If there are no records compatible with the mediaId and postId, will return the status code 404 Not Found.
    </li>
  </ul>
    
  ```javascript
  // body
{
	"mediaId": 1,
	"postId": 1,
	"date": "2023-08-21T13:25:17.352Z"
}
  ```
</details>
<br/>
<li>Get all publications</li>
<details>
  <summary>
  (GET "publications")
  </summary>
  <ul>
    <li>
      Response with all publications registred
    </li>
  </ul>
  
  ```javascript
  // response
[
	{
		"id": 1,
		"mediaId": 1,
		"postId": 1,
		"date": "2023-08-21T13:25:17.352Z"
	},
	{
		"id": 1,
		"mediaId": 2,
		"postId": 1,
		"date": "2023-08-21T13:25:17.352Z"
	},
]
  ```
</details>
<br/>
<li>Get specific publication</li>
<details>
  <summary>
  (GET "publications/:id")
  </summary>
  <ul>
    <li>
      Response with one publication that has the specificated id.
    </li>
  </ul>
  
  ```javascript
  // response
 
[
	{
		"id": 1,
		"mediaId": 1,
		"postId": 1,
		"date": "2023-08-21T13:25:17.352Z"
	},
]

  ```
</details>
</ul>
</details>
<br/>

## Technologies
The following tools and frameworks were used in the construction of the project:
<p>
  <img style='margin: 5px;' src='https://img.shields.io/badge/TypeScript-007ACC?style=for-the-badge&logo=typescript&logoColor=white'/>
  <img style='margin: 5px;' src='https://img.shields.io/badge/nestjs-E0234E?style=for-the-badge&logo=nestjs&logoColor=white'/>
  <img style='margin: 5px;' src='https://img.shields.io/badge/Jest-C21325?style=for-the-badge&logo=jest&logoColor=white'/>
  <img style='margin: 5px;' src='https://img.shields.io/badge/PostgreSQL-316192?style=for-the-badge&logo=postgresql&logoColor=white'/>
  <img style='margin: 5px;' src='https://img.shields.io/badge/Prisma-3982CE?style=for-the-badge&logo=Prisma&logoColor=white'/>
</p>

## How to use
1. Clone this repository
2. Install dependencies
```bash
$ npm i
```

3. Setup your environment variables (.env)

4. Create your database with prisma
```bash
$ npx prisma migrate dev
$ npx prisma generate
```

5. Run the app
```bash
# development
$ npm run start

# watch mode
$ npm run start:dev

# production mode
$ npm run start:prod
```

## Running tests
1. Setup your environment variables (.env.test)
   
2. Create your database with prisma
```bash
$ npm run test:prisma
```

3. Run tests
```bash
# run unit tests
$ npm run test

# run e2e tests
$ npm run test:e2e

# run unit+e2e tests
$ npm run test:all

# run unit coverage tests
$ npm run test:cov

# run unit+e2e coverage tests
$ npm run test:all:cov
```
