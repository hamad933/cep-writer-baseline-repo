# Long-lived CEP Writer Git workflow

1. Controller refreshes main as the Writer-complete baseline.
2. Controller creates one mission branch from one exact main commit.
3. Writer commits/pushes only to that branch; never directly to main, never merges/releases/self-promotes.
4. Controller audits the exact branch HEAD.
5. Rejected work remains candidate lineage while main is unchanged.
6. Accepted Product delta is integrated by Controller into main; Drive live state/custody and Writer inputs are refreshed before the next mission.
