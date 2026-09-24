import {createBoundedLocalRuntimeTransport} from '../../adapters/runtime/local-runtime-transport.js';
import {HealthRuntimeAdapter} from '../../adapters/health-runtime.js';
import {ProcessingRuntimeAdapter} from '../../adapters/processing-runtime.js';
import {createValidationConsumerAdapter} from '../../adapters/validation.js';
import {createManualAiSurfaceComposition} from '../manual_ai/composition.js';
import {ProviderAwareBackupIntegrationAdapter} from '../../adapters/backup-runtime.js';
import {DurableAuditRuntimeAdapter} from '../../adapters/audit.js';
import {createReleasesSurfaceComposition} from '../releases/composition.js';
import {createConfigurationSurfaceComposition} from '../configuration/composition.js';

export const W05_RESCUE_SURFACES=Object.freeze(['health','processing','validation','manual_ai','backup','audit','releases','configuration']);

export function createW05RescueComposition({transport=createBoundedLocalRuntimeTransport(),analyticalCompareOwner=null}={}){
  const health=new HealthRuntimeAdapter({transport});
  const processing=new ProcessingRuntimeAdapter({transport});
  const validation=createValidationConsumerAdapter();
  const manualAi=createManualAiSurfaceComposition();
  const backup=new ProviderAwareBackupIntegrationAdapter({transport});
  const audit=new DurableAuditRuntimeAdapter({transport});
  const releases=createReleasesSurfaceComposition({analyticalCompareOwner});
  const configuration=createConfigurationSurfaceComposition();
  const surfaces=Object.freeze({health,processing,validation,manual_ai:manualAi,backup,audit,releases,configuration});
  return Object.freeze({
    owner:'CG6W05RescueComposition',
    surfaces,
    surfaceIds:[...W05_RESCUE_SURFACES],
    providerBindings:Object.freeze({processing:'ProcessingCapability',backup:'BackupRestoreCapability',audit:'AuditEventProvider'}),
    truthCeilings:Object.freeze({
      healthStates:['AVAILABLE_DATA','AVAILABLE_EMPTY','UNAVAILABLE','ERROR','STALE'],
      queueDepthIsWorkerLiveness:false,
      processingCompletedNeedsProviderEvidence:true,
      cancelRequestIsCancelSuccess:false,
      backupStageVerifyDrillIsLiveRestore:false,
      backupActivationAuthorityPendingOnly:true,
      auditCommandReceiptsAreAuditEvents:false,
      auditHashIsEncryption:false,
      auditDatabaseImmutabilityProven:false,
      manualAiHiddenProviderExecution:false,
      manualAiAutomaticPublish:false,
      releaseReadinessIsAuthorization:false,
      releaseAuthorizationIsDeployment:false,
      configurationUnavailableImpliesRuntimeMutation:false,
      processingStandaloneVisualReference:false
    }),
    ownership:Object.freeze({duplicatePersistenceOwner:false,duplicateProviderOwner:false,surfaceSemanticsMovedIntoProviders:false}),
    finalR6Wiring:false,
    balanced6:'HOLD'
  });
}
