exports.evaluateCompliance = (requirements) => {
  let isCompliant = true;
  const results = requirements.map(req => {
    let passed = false;
    if (req.requiredValue === req.offeredValue) passed = true;
    else if (req.operator === '>=' && parseFloat(req.offeredValue) >= parseFloat(req.requiredValue)) passed = true;
    
    if (req.mandatory && !passed) isCompliant = false;
    req.status = passed ? 'PASS' : 'FAIL';
    return req;
  });
  return { isCompliant, results };
};