/**
 * The campaign record's labels.
 *
 * Two of these come straight from the Seed's routine calls (the record's
 * contents, the world dying with the Master); the rest is the shape this
 * build chose to express them in, and says so.
 */
import type { Behaviour } from '../labels'

export const campaignBehaviours: readonly Behaviour[] = Object.freeze([
  {
    id: 'campaign.one-record-per-campaign',
    label: 'invention',
    cite: 'spec.md, Horizon; plan/bearings.md (Routine calls)',
  },
  {
    id: 'campaign.the-world-dies-with-the-master',
    label: 'invention',
    cite: 'plan/bearings.md (Routine calls)',
  },
  {
    id: 'campaign.overspend-is-marked-never-refused',
    label: 'rule',
    cite: 'spec.md, Refusals (creation pools are advisory)',
  },
  {
    id: 'campaign.manual-entry-counts-as-an-override',
    label: 'invention',
    cite: 'spec.md, Horizon; plan/bearings.md (Routine calls)',
  },
  {
    id: 'campaign.export-is-the-backup',
    label: 'invention',
    cite: 'spec.md, Refusals (no accounts, no cloud sync)',
  },
  {
    id: 'campaign.migrations-are-keyed-on-reading-ids',
    label: 'invention',
    cite: 'plan/bearings.md (Routine calls); plan/phases/phase_6_campaign_record_and_save.md',
  },
  {
    id: 'campaign.an-unreadable-file-is-data-not-an-exception',
    label: 'invention',
    cite: 'spec.md, Refusals (a refusal is data)',
  },
])
