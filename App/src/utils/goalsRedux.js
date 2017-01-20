import _ from 'lodash'
import { getMetadata } from './metadataRequest'

// get goals for all profiles
const mainGoalsFunction = store => {
  const getGoalsListAjaxCall = store => {
    const accountId = store.accountsList.selection
    const webPropertyId = store.webPropertiesList.selection
    const profileId = store.profilesList.selection
    const goalsUri = 'https://www.googleapis.com/analytics/v3/management/accounts/'
    const goalsRequestUri = goalsUri + accountId + '/webproperties/' + webPropertyId + '/profiles/' + profileId + '/goals'

    const settings = {
      'async': true,
      'crossDomain': true,
      'url': goalsRequestUri,
      'method': 'GET',
      'dataType': 'json',
      'headers': {
        'Authorization': 'Bearer ' + store.accessToken,
        'cache-control': 'private, max-age=0, must-revalidate, no-transform',
        'content-type': 'application/json; charset=UTF-8'
      }
    }
    return $.ajax(settings)
  }

  const fetchGoals = getGoalsListAjaxCall(store)
  const fetchColumns = getMetadata(store)
  const promises = [fetchGoals, fetchColumns]

  Promise.all(promises)
    .then(resp => {
      // filter each response down to just the items we need
      const columnGoalsPattern = /ga:goalXX.*/
      const filteredGoals = resp[0].items.filter(d => d.active)
      const filteredColumns = resp[1].items.filter(d => columnGoalsPattern.test(d.id))
      return [filteredGoals, filteredColumns]
    })
    .then(resp => {
      // split column values into usable parts
      resp[1].map(column => {
        // removing 'Goal XX ' from the uiName for suffix
        column.suffix = column.attributes.uiName.slice(8)
      })
      return resp
    })
    .then(resp => {
      const constructedGoals = []

      resp[0].map(goal => {
        resp[1].map(column => {
          constructedGoals.push({
            uiobject: goal.name + ' ' + column.suffix,
            dataname: column.id.replace(/(.*)XX(.*)/, '$1' + goal.id + '$2'),
            type: goal.type
          })
        })
      })
      console.log('constructedGoals:')
      console.log(constructedGoals)
      return constructedGoals
    })
    .then(resp => {
      // set new goalType attribute to either metric or dimension based on incoming type value
      resp.map(d => {
        const isMetric = _.includes(['VISIT_TIME_ON_SITE', 'VISIT_NUM_PAGES', 'EVENT'], d.type)
        if (isMetric) {
          d.goalType = 'METRIC'
        } else {
          d.goalType = 'DIMENSION'
        }
      })
      console.log('added goalType attribute:')
      console.log(resp)
      return resp
    })
    .then(resp => {
      // push metric and dimension goals to the correct list
      console.log('resp @ start of push step')
      console.log(resp)
      store.metricsGoalsList.stringList = []
      store.dimensionsGoalsList.stringList = []

      resp.map(d => {
        if (d.goalType === 'METRIC') {
          store.metricsGoalsList.stringList.push({
            uiobject: d.uiobject,
            dataname: d.dataname
          })
        } else if (d.goalType === 'DIMENSION') {
          store.dimensionsGoalsList.stringList.push({
            uiobject: d.uiobject,
            dataname: d.dataname
          })
        }
      })
      console.log('metrics and dimensions goals are pushed')
    })
}

export { mainGoalsFunction }
