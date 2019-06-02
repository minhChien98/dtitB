module.exports = {
  NAMESPACE: {
    LOGIN: 'login',
    AUTH: 'auth',
    ADMIN: 'admin',
    VIEWER: 'viewer',
    USER: 'user',
    ANSWER: 'answer',
    QUESTION: 'question',
    DISCONNECT: 'disconnect'
  },
  ROOMS: {
    ADMIN: 'admin room',
    VIEWER: 'viewer room',
    USER: 'user room'
  },

  RECEIVE: {
    //1000
    LOGIN:
    {
      AUTH: 1000
    }
  },
  RETURN: {
    //1000
    AUTH:
    {
      LOGIN: 1000,
      USER_GO_ONLINE: 1001,
      DISCONNECT: 1002
    },
    QUEST:
    {
      RAISE: 2000,
      CHOOSE_ANSWER: 2001,
      FINISHED_ROUTE: 2002
    }
  }
};
