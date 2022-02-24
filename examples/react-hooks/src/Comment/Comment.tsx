import React from 'react'
import { Comment, Avatar } from 'antd'
import { Editor, EditorModule } from './Editor'
import { useContainer, Container } from '../../../../src'
import { UserInfo, useGlobalContextLoginUser } from '../GlobalContext'

type CommentInfo = {
  id: string
  content: string
  author: UserInfo
  replies: Omit<CommentInfo, 'replies'>[]
}

export function BlogComment() {
  const loginUser = useGlobalContextLoginUser()
  const module = useContainer(blogCommentModule)

  const handleSubmit = (content: string) => {
    module.addComment({
      id: '',
      content: content,
      author: loginUser,
    })
  }

  return (
    <>
      <Editor onSubmit={handleSubmit} />
      {renderComment(module.state.comments)}
    </>
  )
}

type CommentModelState = {
  comments: CommentInfo[]
  activeId: null | CommentInfo['id']
}

class BlogCommentModule extends Container<CommentModelState> {
  state = {
    comments: [] as CommentInfo[],
    activeId: null,
  }

  addComment(comment: Omit<CommentInfo, 'replies'>) {
    if (!comment.content) return

    if (comment.id) {
      this.addReply(comment.id, comment.content, comment.author)
    } else {
      const newComment = {
        ...comment,
        id: Math.random() + '',
        replies: [],
      }

      this.setState({
        comments: [newComment, ...this.state.comments],
      })
    }
  }

  addReply(commentId: string, content: string, author: UserInfo) {
    const comment = this.state.comments.find((comment) => comment.id === commentId)

    comment?.replies.unshift({
      id: Math.random() + '',
      content,
      author,
    })

    this.setState({
      comments: [...this.state.comments],
    })
  }

  get EditorModel() {
    return this.use(EditorModule)
  }
}

export const blogCommentModule = new BlogCommentModule()

const BLOG_COMMENT_CACHE_KEY = 'blogCommentModule'

blogCommentModule.subscribe(() => {
  store()
})

restore()

function store() {
  localStorage.setItem(BLOG_COMMENT_CACHE_KEY, JSON.stringify(blogCommentModule.state))
}

function restore() {
  try {
    const state = JSON.parse(localStorage.getItem(BLOG_COMMENT_CACHE_KEY) || '')
    blogCommentModule.setState(state)
  } catch (err) {
    console.warn(err)
  }
}

function renderComment(comments: CommentInfo[]) {
  return comments.map((comment) => (
    <Comment
      key={comment.id}
      actions={[<span key="comment-nested-reply-to">Reply to</span>]}
      author={comment.author.name}
      avatar={<Avatar src={comment.author.avatar} alt={comment.author.name} />}
      content={<p>{comment.content}</p>}
    >
      {renderComment(comment.replies as CommentInfo[])}
    </Comment>
  ))
}
