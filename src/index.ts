import * as bp from '.botpress'
import { handler } from './handler'
import actions from './actions'
import channels from './channels'

export default new bp.Integration({
  register: async ({ logger }) => {
    logger.forBot().info('Registering Todoist integration')
  },
  unregister: async ({ logger }) => {
    logger.forBot().info('Unregistering Todoist integration')
  },
  actions,
  channels,
  handler,
})
