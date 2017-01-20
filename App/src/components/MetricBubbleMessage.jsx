import React from 'react'
import { observer } from 'mobx-react'

class MetricBubbleMessage extends React.Component {
  constructor (props) {
    super(props)
    this.store = props.store
  }

  addClass (total) {
    return total < 1 || total > 10 ? 'bubbleWarning' : ''
  }

  messageText (total) {
    let text

    if (total < 1) {
      text = 'At least one metric must be selected.'
    } else if (total > 10) {
      text = 'Maximum of ten metrics and goals may be selected.'
    } else {
      text = ''
    };

    return text
  }

  render () {
    const total = this.store.totalMetricsAndGoals
    const text = this.messageText(total)
    const divClass = this.addClass(total)

    return (
      <div id='metricWarning' className={divClass}>
        {text}
      </div>
    )
  }
}
export default observer(MetricBubbleMessage)
