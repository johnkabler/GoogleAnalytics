// checkbox disable/enable function definition
const inputControl = (parentId, inputType, totalSelected, threshold) => {
  const parentNode = document.getElementById(parentId)
  const checkboxes = parentNode.querySelectorAll('input[type="' + inputType + '"]')

  const disableUnchecked = (nodeArray) => {
    for (let i = 0; i < nodeArray.length; i++) {
      if (!nodeArray[i].checked) {
        nodeArray[i].setAttribute('disabled', true)
      }
    }
  }

  const enableAll = (nodeArray) => {
    for (let i = 0; i < nodeArray.length; i++) {
      nodeArray[i].removeAttribute('disabled')
    }
  }

  if (totalSelected >= threshold) {
    disableUnchecked(checkboxes)
  } else {
    enableAll(checkboxes)
  }
}

export default inputControl
