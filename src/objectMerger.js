export function mergePropertiesFromObject(mainObj, props, suppObj) {
  let update = false;

  props.forEach(prop => {
    if (!suppObj[prop]) {
      return;
    }

    if (JSON.stringify(mainObj[prop]) === JSON.stringify(suppObj[prop])) {
      return;
    }

    mainObj[prop] = suppObj[prop];
    update = true;
  });

  return update;
}
