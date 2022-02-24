import React from 'react'

export type UserInfo = {
  id: string
  name: string
  avatar: string
}

export const GlobalContext = React.createContext({
  loginUser: {
    id: 'mock_id',
    name: '法外狂徒-张三',
    avatar: 'https://joeschmoe.io/api/v1/random',
  },
})

export const useGlobalContextLoginUser = () => {
  return React.useContext(GlobalContext).loginUser
}
