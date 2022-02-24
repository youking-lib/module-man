import React from 'react'
import { Form, Button, Input } from 'antd'
import { useModule, Module } from '../../../../src'
import { UserInfo } from '../GlobalContext'

const { TextArea } = Input

export type EditorProps = {
  onChange?: (value: string) => void
  onSubmit?: (content: string) => void
}

export class EditorModule extends Module<{ value: string; loading: boolean }> {
  state = {
    value: '123',
    loading: false,
  }

  mention(user: UserInfo) {
    this.setState({
      value: this.state.value + '@' + user.name,
    })
  }

  clear() {
    this.setState({
      value: '',
    })
  }
}

export const Editor = (props: EditorProps) => {
  const { onChange, onSubmit } = props
  const editorModule = useModule(EditorModule)

  const handleChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    onChange && onChange(e.target.value)
    editorModule.setState({
      value: e.target.value,
    })
  }

  const handleSubmit = () => {
    onSubmit && onSubmit(editorModule.state.value)
    editorModule.clear()
  }

  return (
    <>
      <Form.Item>
        <TextArea rows={4} onChange={handleChange} value={editorModule.state.value} />
      </Form.Item>
      <Form.Item>
        <Button htmlType="submit" loading={editorModule.state.loading} onClick={handleSubmit} type="primary">
          Add Comment
        </Button>
      </Form.Item>
    </>
  )
}
