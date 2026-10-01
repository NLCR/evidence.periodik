import * as React from 'react'
import whyDidYouRender from '@welldone-software/why-did-you-render'

if (import.meta.env.NODE_ENV === 'development') {
  whyDidYouRender(React, {
    // trackAllPureComponents: true,
    trackHooks: true,
    exclude: [/^RouterProvider/, /^Link/, /^Route/],
  })
}
