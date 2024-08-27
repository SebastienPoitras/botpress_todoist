import { z, IntegrationDefinition, messages } from '@botpress/sdk'

const ItemDefinition = z.object({
  id: z.string(),
  user_id: z.string(),
  content: z.string(),
  description: z.string(),
  priority: z.number(),
})

export default new IntegrationDefinition({
  name: 'sebastien_poitras/botpress-todoist',
  version: '0.0.1',
  readme: 'README.md',
  icon: 'icon.svg',
  channels: {
    comments: {
      messages: {
        text: messages.defaults.text,
      },
      conversation: {
        tags: {
          id: {
            title: 'Task ID',
            description: 'The ID of the task',
          },
        },
      },
      message: {
        tags: {
          id: {
            title: 'Comment ID',
            description: 'The ID of the comment',
          },
        },
      },
    },
  },
  user: {
    tags: {
      id: {
        title: 'User ID',
        description: 'The ID of a user',
      },
    },
  },
  actions: {
    createComment: {
      title: 'Create Comment',
      description: 'Create a comment',
      input: {
        schema: z.object({
          taskId: z.string(),
          content: z.string(),
        }),
      },
      output: {
        schema: z.object({
          commentId: z.string(),
        }),
      },
    },
    createTask: {
      title: 'Create Task',
      description: 'Create a task',
      input: {
        schema: z.object({
          content: z.string(),
          description: z.string(),
          priority: z.number(),
          parentTaskId: z.string().optional(),
        }),
      },
      output: {
        schema: z.object({
          taskId: z.string(),
        }),
      },
    },
    changeTaskPriority: {
      title: 'Change Task Priority',
      description: 'Change the priority of a task',
      input: {
        schema: z.object({
          taskId: z.string(),
          priority: z.number(),
        }),
      },
      output: {
        schema: z.object({}),
      },
    },
    getTaskId: {
      title: 'Get Task ID',
      description: 'Get the ID of the first task matching the given name',
      input: {
        schema: z.object({
          name: z.string(),
        }),
      },
      output: {
        schema: z.object({
          taskId: z.string().nullable(),
        }),
      },
    },
  },
  events: {
    taskAdded: {
      title: 'Task Added',
      description: 'A task has been added',
      schema: z.object({
        id: z.string(),
        user_id: z.string(),
        content: z.string(),
        description: z.string(),
        priority: z.number(),
      }),
    },
    taskPriorityChanged: {
      title: 'Task Priority Changed',
      description: 'The priority of a task has been changed',
      schema: z.object({
        id: z.string(),
        newPriority: z.number(),
        oldPriority: z.number(),
      }),
    },
    taskCompleted: {
      title: 'Task Completed',
      description: 'A task has been completed',
      schema: ItemDefinition,
    },
  },
  configuration: {
    schema: z.object({
      apiToken: z.string(),
    }),
  },
})
