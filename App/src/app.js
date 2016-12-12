import React from 'react'
import ReactDOM from 'react-dom'
import { setFreshAccessToken, login, displayFieldset } from './utils/utils'
import AyxStore from './stores/AyxStore'
import * as accounts from './utils/accountUtils'
import * as metadataRequest from './utils/metadataRequest'
import { extendObservable, autorun } from 'mobx'
import * as goals from './utils/goals'
import * as segments from './utils/segments'
import MetricMessage from './components/metricMessage.jsx'
import DimensionMessage from './components/dimensionMessage.jsx'
import moment from 'moment'
import * as picker from './utils/datePickers'
import SegmentMessage from './components/segmentMessage.jsx'
import DateMessage from './components/dateMessage.jsx'

Alteryx.Gui.AfterLoad = (manager) => {
  // Adds metrics.metricsSelectionCheck to UserDataChanged of metricsList
  // bind functions no longer necessary due to metricMessage.js and dimensionMessage.js
  // metrics.bindMetricCheck()
  // dimensions.bindDimensionCheck()

  const collection = [
    {key: 'client_id', type: 'value'},
    {key: 'client_secret', type: 'value'},
    {key: 'refresh_token', type: 'value'},
    {key: 'accessToken', type: 'value'},
    {key: 'metricsList', type: 'listBox'},
    {key: 'metricsGoalsList', type: 'listBox'},
    {key: 'dimensionsGoalsList', type: 'listBox'},
    {key: 'accountsList', type: 'dropDown'},
    {key: 'webPropertiesList', type: 'dropDown'},
    {key: 'profilesList', type: 'dropDown'},
    {key: 'dimensionsList', type: 'listBox'},
    {key: 'startDatePicker', type: 'value'},
    {key: 'endDatePicker', type: 'value'},
    {key: 'preDefDropDown', type: 'value'},
    {key: 'dimensionsList', type: 'listBox'},
    {key: 'segmentsList', type: 'listBox'}
  ]

  // Instantiate the mobx store which will sync all dataItems
  // specified in the collection.
  const store = new AyxStore(manager, collection)

  // Set Predefined dropdown to custom value if it is undefined.
  if (!store.preDefDropDown) {
    store.preDefDropDown = 'custom'
  }

  extendObservable(store, {
    // Add computed value to store that tracks total selections for metrics and metric goals.
    totalMetricsAndGoals: () => {
      let total = store.metricsList.selection.length + store.metricsGoalsList.selection.length
      return total
    },
    // Add computed value to store that tracks total selections for dimensions and dimension goals.
    totalDimensionsAndGoals: () => {
      let total = store.dimensionsList.selection.length + store.dimensionsGoalsList.selection.length
      return total
    },
    // Render react component which handles Metric selection messaging.
    totalSegments: () => {
      let total = store.segmentsList.selection.length
      return total
    },
    // Compute if startDatePicker value is greater than endDatePicker value
    startIsAfterEnd: () => {
      return store.startDatePicker > store.endDatePicker
    },
    // Compute start date for currently selected preDefDropDown value
    preDefStart: () => {
      if (store.preDefDropDown === 'custom') {
        return store.startDatePicker
      } else {
        return picker.setDates(store.preDefDropDown).start
      }
    },
    // Compute end date for currently selected preDefDropDown value
    preDefEnd: () => {
      if (store.preDefDropDown === 'custom') {
        return store.endDatePicker
      } else {
        return picker.setDates(store.preDefDropDown).end
      }
    },
    // Compute if preDefined date values match currently set picker values
    isCustomDate: () => {
      return store.startDatePicker !== store.preDefStart ||
             store.endDatePicker !== store.preDefEnd
    }
  })

  // When a custom date is selected, switch preDefined selector to 'custom'
  autorun(() => {
    if (store.isCustomDate) {
      store.preDefDropDown = 'custom'
    }
  })

  autorun(() => {
    if (store.preDefDropDown) {
      if (store.preDefDropDown !== 'custom') {
        store.startDatePicker = store.preDefStart
        store.endDatePicker = store.preDefEnd
      }
    }
  })

  // Populate profiles list if webproperties has no selection and no stringlist
  autorun(() => {
    if (store.webPropertiesList.selection !== '' &&
        store.webPropertiesList.stringList.length > 0) {
      accounts.populateProfilesMenu(store)
    }
  })

  autorun(() => {
    if (store.accessToken !== '' || store.accountsList.stringList.length < 1) {
      accounts.populateAccountsList(store)
      metadataRequest.pushCombinedMetadata(store)
      goals.populateMetricsGoalsList(store)
      goals.populateDimensionsGoalsList(store)
    }
  })

  autorun(() => {
    if (store.accountsList.selection !== '') {
      accounts.populateWebPropertiesList(store)
    }
  })

  // Render react component which handles Metric selection messaging.
  ReactDOM.render(<MetricMessage store={store} />, document.querySelector('#selectedMetrics'))
  // Render react component which handles Dimension selection messaging.
  ReactDOM.render(<DimensionMessage store={store} />, document.querySelector('#selectedDimensions'))
  // Render react component which handles Segment selection messaging.
  ReactDOM.render(<SegmentMessage store={store} />, document.querySelector('#selectedSegments'))
  // Render react component which handles a warning message for End Date not at or after Start Date.
  ReactDOM.render(<DateMessage store={store} />, document.querySelector('#dateWarning'))

  let optionList = [{uiobject: 'test1', dataname: 'test1 value'},
                    {uiobject: 'test2', dataname: 'test2 value'}]

  store.client_id = '934931015435-4ugtr9vvg2jiefrn9r8t1d8ato000bdq.apps.googleusercontent.com'
  store.client_secret = '2qXTVfi_lkB5ZvutdZlWm9Dr'
  store.refresh_token = '1/-hh4BUqg51tYT4w-YevMPzJ6LuGmx4vzWbCgvUzCrz8'

  // metadataRequest.pushCombinedMetadata(store)
  // goals.populateMetricsGoalsList(store)
  // goals.populateDimensionsGoalsList(store)
  segments.populateSegmentsList(store)

  window.optionList = optionList

  window.store = store

  window.setFreshAccessToken = setFreshAccessToken

  window.login = login

  window.displayFieldset = displayFieldset

  window.populateAccountsList = accounts.populateAccountsList

  window.populateWebPropertiesList = accounts.populateWebPropertiesList

  window.populateProfilesMenu = accounts.populateProfilesMenu

  window.populateMetricsGoalsList = goals.populateMetricsGoalsList

  window.populateDimensionsGoalsList = goals.populateDimensionsGoalsList

  window.moment = moment

  window.getDates = picker.getDates

  window.setDates = picker.setDates

  accounts.populateAccountsList(store)

  // accounts.populateWebPropertiesList(store)
  // accounts.populateProfilesMenu(store)
}
