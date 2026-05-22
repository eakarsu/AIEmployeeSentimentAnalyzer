const express = require('express');
const router = express.Router();

router.get('/', (req, res) => res.json({
  summary: { reports_monitored: 14, retaliation_risk: 3, followups_due: 6, protected_cases: 5 },
  cases: [
    { case_id: 'AR-118', team: 'Sales Ops', signal: 'manager schedule change after report', risk: 'high', action: 'HRBP intervention' },
    { case_id: 'AR-124', team: 'Support', signal: 'peer exclusion language', risk: 'medium', action: 'follow-up pulse' },
    { case_id: 'AR-130', team: 'Engineering', signal: 'no negative signal', risk: 'low', action: 'monitor' },
  ],
}));

module.exports = router;
