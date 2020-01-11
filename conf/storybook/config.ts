import { addDecorator } from '@storybook/react'
import { configure } from '@storybook/react'
import { fontDecorator } from './decorators/font'

addDecorator(fontDecorator)

configure(require.context('../../src', true, /\.stories\.tsx$/), module)

