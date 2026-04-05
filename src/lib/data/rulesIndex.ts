/**
 * Curated hierarchical index of all Racing Rules of Sailing (2025–2028).
 * Maps to canonical markdown files in /rules/ at project root.
 *
 * Types:
 *   standalone — top-level document (no parent part)
 *   part       — collapsible group; has .preamble? and .children[]
 *   section    — sub-group within a part; has .preamble? and .children[]
 *   rule       — leaf node; has a .path to load
 */

export interface RuleLeaf {
  id: string
  title: string
  type: 'rule' | 'standalone'
  path: string
}

export interface RuleGroup {
  id: string
  title: string
  type: 'part' | 'section'
  preamble?: RuleLeaf
  children: RuleNode[]
}

export type RuleNode = RuleLeaf | RuleGroup

export const RULES_INDEX: RuleNode[] = [
  // ── Standalone documents ──────────────────────────────────────────
  {
    id: 'introduction',
    title: 'Introduction',
    type: 'standalone',
    path: '/rules/introduction/introduction.md',
  },
  {
    id: 'definitions',
    title: 'Definitions',
    type: 'standalone',
    path: '/rules/definitions/definitions.md',
  },
  {
    id: 'basic_principles',
    title: 'Basic Principles',
    type: 'standalone',
    path: '/rules/basic_principles/basic_principles.md',
  },

  // ── Part 1 ────────────────────────────────────────────────────────
  {
    id: 'part1',
    title: 'Part 1 — Fundamental Rules',
    type: 'part',
    preamble: { id: 'part1_preamble', title: 'Preamble', path: '/rules/part1_fundamental_rules/preamble.md', type: 'rule' },
    children: [
      { id: 'rule_01', title: 'Rule 1 — Safety',                      path: '/rules/part1_fundamental_rules/rule_01_safety.md',                    type: 'rule' },
      { id: 'rule_02', title: 'Rule 2 — Fair Sailing',                 path: '/rules/part1_fundamental_rules/rule_02_fair_sailing.md',               type: 'rule' },
      { id: 'rule_03', title: 'Rule 3 — Decision to Race',             path: '/rules/part1_fundamental_rules/rule_03_decision_to_race.md',           type: 'rule' },
      { id: 'rule_04', title: 'Rule 4 — Acceptance of Rules',          path: '/rules/part1_fundamental_rules/rule_04_acceptance_of_rules.md',        type: 'rule' },
      { id: 'rule_05', title: 'Rule 5 — Rules Governing Officials',    path: '/rules/part1_fundamental_rules/rule_05_rules_governing_officials.md',  type: 'rule' },
      { id: 'rule_06', title: 'Rule 6 — World Sailing Regulations',    path: '/rules/part1_fundamental_rules/rule_06_world_sailing_regulations.md',  type: 'rule' },
    ],
  },

  // ── Part 2 ────────────────────────────────────────────────────────
  {
    id: 'part2',
    title: 'Part 2 — When Boats Meet',
    type: 'part',
    preamble: { id: 'part2_preamble', title: 'Preamble', path: '/rules/part2_when_boats_meet/preamble.md', type: 'rule' },
    children: [
      {
        id: 'part2_sec_a',
        title: 'Section A — Right of Way',
        type: 'section',
        preamble: { id: 'part2_sec_a_preamble', title: 'Preamble', path: '/rules/part2_when_boats_meet/section_a_right_of_way/preamble.md', type: 'rule' },
        children: [
          { id: 'rule_10', title: 'Rule 10 — On Opposite Tacks',          path: '/rules/part2_when_boats_meet/section_a_right_of_way/rule_10_on_opposite_tacks.md',           type: 'rule' },
          { id: 'rule_11', title: 'Rule 11 — On the Same Tack, Overlapped', path: '/rules/part2_when_boats_meet/section_a_right_of_way/rule_11_on_the_same_tack_overlapped.md', type: 'rule' },
          { id: 'rule_12', title: 'Rule 12 — On the Same Tack, Not Overlapped', path: '/rules/part2_when_boats_meet/section_a_right_of_way/rule_12_on_the_same_tack_not_overlapped.md', type: 'rule' },
          { id: 'rule_13', title: 'Rule 13 — While Tacking',              path: '/rules/part2_when_boats_meet/section_a_right_of_way/rule_13_while_tacking.md',               type: 'rule' },
        ],
      },
      {
        id: 'part2_sec_b',
        title: 'Section B — General Limitations',
        type: 'section',
        preamble: { id: 'part2_sec_b_preamble', title: 'Preamble', path: '/rules/part2_when_boats_meet/section_b_general_limitations/preamble.md', type: 'rule' },
        children: [
          { id: 'rule_14', title: 'Rule 14 — Avoiding Contact',           path: '/rules/part2_when_boats_meet/section_b_general_limitations/rule_14_avoiding_contact.md',             type: 'rule' },
          { id: 'rule_15', title: 'Rule 15 — Acquiring Right of Way',     path: '/rules/part2_when_boats_meet/section_b_general_limitations/rule_15_acquiring_right_of_way.md',       type: 'rule' },
          { id: 'rule_16', title: 'Rule 16 — Changing Course',            path: '/rules/part2_when_boats_meet/section_b_general_limitations/rule_16_changing_course.md',              type: 'rule' },
          { id: 'rule_17', title: 'Rule 17 — On the Same Tack; Proper Course', path: '/rules/part2_when_boats_meet/section_b_general_limitations/rule_17_on_the_same_tack_proper_course.md', type: 'rule' },
        ],
      },
      {
        id: 'part2_sec_c',
        title: 'Section C — Marks and Obstructions',
        type: 'section',
        preamble: { id: 'part2_sec_c_preamble', title: 'Preamble', path: '/rules/part2_when_boats_meet/section_c_marks_and_obstructions/preamble.md', type: 'rule' },
        children: [
          { id: 'rule_18', title: 'Rule 18 — Mark-Room',                  path: '/rules/part2_when_boats_meet/section_c_marks_and_obstructions/rule_18_mark_room.md',                    type: 'rule' },
          { id: 'rule_19', title: 'Rule 19 — Room to Pass an Obstruction', path: '/rules/part2_when_boats_meet/section_c_marks_and_obstructions/rule_19_room_to_pass_an_obstruction.md', type: 'rule' },
          { id: 'rule_20', title: 'Rule 20 — Room to Tack at an Obstruction', path: '/rules/part2_when_boats_meet/section_c_marks_and_obstructions/rule_20_room_to_tack_at_an_obstruction.md', type: 'rule' },
        ],
      },
      {
        id: 'part2_sec_d',
        title: 'Section D — Other Rules',
        type: 'section',
        preamble: { id: 'part2_sec_d_preamble', title: 'Preamble', path: '/rules/part2_when_boats_meet/section_d_other_rules/preamble.md', type: 'rule' },
        children: [
          { id: 'rule_21', title: 'Rule 21 — Exonerations',               path: '/rules/part2_when_boats_meet/section_d_other_rules/rule_21_exonerations.md',              type: 'rule' },
          { id: 'rule_22', title: 'Rule 22 — Capsized, Anchored or Aground; Rescuing', path: '/rules/part2_when_boats_meet/section_d_other_rules/rule_22_capsized_anchored_or_aground_rescuing.md', type: 'rule' },
          { id: 'rule_23', title: 'Rule 23 — Interfering with Another Boat', path: '/rules/part2_when_boats_meet/section_d_other_rules/rule_23_interfering_with_another_boat.md', type: 'rule' },
        ],
      },
    ],
  },

  // ── Part 3 ────────────────────────────────────────────────────────
  {
    id: 'part3',
    title: 'Part 3 — Conduct of a Race',
    type: 'part',
    preamble: { id: 'part3_preamble', title: 'Preamble', path: '/rules/part3_conduct_of_a_race/preamble.md', type: 'rule' },
    children: [
      { id: 'rule_25', title: 'Rule 25 — Notice of Race; Sailing Instructions', path: '/rules/part3_conduct_of_a_race/rule_25_notice_of_race_sailing_instructions.md', type: 'rule' },
      { id: 'rule_26', title: 'Rule 26 — Starting Races',              path: '/rules/part3_conduct_of_a_race/rule_26_starting_races.md',                        type: 'rule' },
      { id: 'rule_27', title: 'Rule 27 — Other Race Committee Actions Before the Starting Signal', path: '/rules/part3_conduct_of_a_race/rule_27_other_race_committee_actions_before.md', type: 'rule' },
      { id: 'rule_28', title: 'Rule 28 — Sailing the Course',          path: '/rules/part3_conduct_of_a_race/rule_28_sailing_the_course.md',                    type: 'rule' },
      { id: 'rule_29', title: 'Rule 29 — Recalls',                     path: '/rules/part3_conduct_of_a_race/rule_29_recalls.md',                               type: 'rule' },
      { id: 'rule_30', title: 'Rule 30 — Starting Penalties',          path: '/rules/part3_conduct_of_a_race/rule_30_starting_penalties.md',                    type: 'rule' },
      { id: 'rule_31', title: 'Rule 31 — Touching a Mark',             path: '/rules/part3_conduct_of_a_race/rule_31_touching_a_mark.md',                       type: 'rule' },
      { id: 'rule_32', title: 'Rule 32 — Shortening or Abandoning After the Start', path: '/rules/part3_conduct_of_a_race/rule_32_shortening_or_abandoning_after_the_start.md', type: 'rule' },
      { id: 'rule_33', title: 'Rule 33 — Changing the Next Leg of the Course', path: '/rules/part3_conduct_of_a_race/rule_33_changing_the_next_leg_of_the_course.md', type: 'rule' },
      { id: 'rule_34', title: 'Rule 34 — Mark Missing',                path: '/rules/part3_conduct_of_a_race/rule_34_mark_missing.md',                          type: 'rule' },
      { id: 'rule_35', title: 'Rule 35 — Race Time Limit and Scores',  path: '/rules/part3_conduct_of_a_race/rule_35_race_time_limit_and_scores.md',             type: 'rule' },
      { id: 'rule_36', title: 'Rule 36 — Races Restarted or Resailed', path: '/rules/part3_conduct_of_a_race/rule_36_races_restarted_or_resailed.md',            type: 'rule' },
      { id: 'rule_37', title: 'Rule 37 — Search and Rescue Instructions', path: '/rules/part3_conduct_of_a_race/rule_37_search_and_rescue_instructions.md',      type: 'rule' },
    ],
  },

  // ── Part 4 ────────────────────────────────────────────────────────
  {
    id: 'part4',
    title: 'Part 4 — Other Requirements When Racing',
    type: 'part',
    preamble: { id: 'part4_preamble', title: 'Preamble', path: '/rules/part4_other_requirements/preamble.md', type: 'rule' },
    children: [
      {
        id: 'part4_sec_a',
        title: 'Section A — General',
        type: 'section',
        preamble: { id: 'part4_sec_a_preamble', title: 'Preamble', path: '/rules/part4_other_requirements/section_a_general/preamble.md', type: 'rule' },
        children: [
          { id: 'rule_40', title: 'Rule 40 — Personal Flotation Devices', path: '/rules/part4_other_requirements/section_a_general/rule_40_personal_flotation_devices.md', type: 'rule' },
          { id: 'rule_41', title: 'Rule 41 — Outside Help',               path: '/rules/part4_other_requirements/section_a_general/rule_41_outside_help.md',               type: 'rule' },
          { id: 'rule_42', title: 'Rule 42 — Propulsion',                 path: '/rules/part4_other_requirements/section_a_general/rule_42_propulsion.md',                 type: 'rule' },
          { id: 'rule_43', title: 'Rule 43 — Exoneration',                path: '/rules/part4_other_requirements/section_a_general/rule_43_exoneration.md',                type: 'rule' },
          { id: 'rule_44', title: 'Rule 44 — Penalties at the Time of an Incident', path: '/rules/part4_other_requirements/section_a_general/rule_44_penalties_at_the_time_of_an_incident.md', type: 'rule' },
          { id: 'rule_45', title: 'Rule 45 — Hauling Out; Making Fast; Anchoring', path: '/rules/part4_other_requirements/section_a_general/rule_45_hauling_out_making_fast_anchoring.md', type: 'rule' },
          { id: 'rule_46', title: 'Rule 46 — Person in Charge',           path: '/rules/part4_other_requirements/section_a_general/rule_46_person_in_charge.md',           type: 'rule' },
          { id: 'rule_47', title: 'Rule 47 — Trash Disposal',             path: '/rules/part4_other_requirements/section_a_general/rule_47_trash_disposal.md',             type: 'rule' },
        ],
      },
      {
        id: 'part4_sec_b',
        title: 'Section B — Equipment',
        type: 'section',
        preamble: { id: 'part4_sec_b_preamble', title: 'Preamble', path: '/rules/part4_other_requirements/section_b_equipment/preamble.md', type: 'rule' },
        children: [
          { id: 'rule_48', title: 'Rule 48 — Limitations on Equipment and Crew',    path: '/rules/part4_other_requirements/section_b_equipment/rule_48_limitations_on_equipment_and_crew.md', type: 'rule' },
          { id: 'rule_49', title: 'Rule 49 — Crew Position; Lifelines',             path: '/rules/part4_other_requirements/section_b_equipment/rule_49_crew_position_lifelines.md',           type: 'rule' },
          { id: 'rule_50', title: 'Rule 50 — Competitor Clothing and Equipment',    path: '/rules/part4_other_requirements/section_b_equipment/rule_50_competitor_clothing_and_equipment.md', type: 'rule' },
          { id: 'rule_51', title: 'Rule 51 — Movable Ballast',                      path: '/rules/part4_other_requirements/section_b_equipment/rule_51_movable_ballast.md',                   type: 'rule' },
          { id: 'rule_52', title: 'Rule 52 — Manual Power',                         path: '/rules/part4_other_requirements/section_b_equipment/rule_52_manual_power.md',                      type: 'rule' },
          { id: 'rule_53', title: 'Rule 53 — Skin Friction',                        path: '/rules/part4_other_requirements/section_b_equipment/rule_53_skin_friction.md',                     type: 'rule' },
          { id: 'rule_54', title: 'Rule 54 — Forestays and Headsail Tacks',         path: '/rules/part4_other_requirements/section_b_equipment/rule_54_forestays_and_headsail_tacks.md',      type: 'rule' },
          { id: 'rule_55', title: 'Rule 55 — Setting and Sheeting Sails',           path: '/rules/part4_other_requirements/section_b_equipment/rule_55_setting_and_sheeting_sails.md',        type: 'rule' },
          { id: 'rule_56', title: 'Rule 56 — Fog Signals and Lights; Traffic Separation', path: '/rules/part4_other_requirements/section_b_equipment/rule_56_fog_signals_and_lights_traffic_separation.md', type: 'rule' },
        ],
      },
    ],
  },

  // ── Part 5 ────────────────────────────────────────────────────────
  {
    id: 'part5',
    title: 'Part 5 — Protests, Redress, Hearings, Misconduct',
    type: 'part',
    preamble: { id: 'part5_preamble', title: 'Preamble', path: '/rules/part5_protests_redress/preamble.md', type: 'rule' },
    children: [
      {
        id: 'part5_sec_a',
        title: 'Section A — Protests',
        type: 'section',
        preamble: { id: 'part5_sec_a_preamble', title: 'Preamble', path: '/rules/part5_protests_redress/section_a_protests/preamble.md', type: 'rule' },
        children: [
          { id: 'rule_60', title: 'Rule 60 — Right to Protest; Right to Request Redress or Rule 69 Action', path: '/rules/part5_protests_redress/section_a_protests/rule_60_protests.md', type: 'rule' },
          { id: 'rule_61', title: 'Rule 61 — Redress',                    path: '/rules/part5_protests_redress/section_a_protests/rule_61_redress.md',        type: 'rule' },
          { id: 'rule_62', title: 'Rule 62 — Support Persons',            path: '/rules/part5_protests_redress/section_a_protests/rule_62_support_persons.md', type: 'rule' },
        ],
      },
      {
        id: 'part5_sec_b',
        title: 'Section B — Hearings and Decisions',
        type: 'section',
        preamble: { id: 'part5_sec_b_preamble', title: 'Preamble', path: '/rules/part5_protests_redress/section_b_hearings/preamble.md', type: 'rule' },
        children: [
          { id: 'rule_63', title: 'Rule 63 — Hearings',                   path: '/rules/part5_protests_redress/section_b_hearings/rule_63_conduct_of_hearings.md',      type: 'rule' },
          { id: 'rule_64', title: 'Rule 64 — Decisions',                  path: '/rules/part5_protests_redress/section_b_hearings/rule_64_discretionary_penalties.md',  type: 'rule' },
          { id: 'rule_65', title: 'Rule 65 — Legal Liability and Costs',  path: '/rules/part5_protests_redress/section_b_hearings/rule_65_legal_liability_and_costs.md', type: 'rule' },
        ],
      },
      {
        id: 'part5_sec_c',
        title: 'Section C — Misconduct',
        type: 'section',
        preamble: { id: 'part5_sec_c_preamble', title: 'Preamble', path: '/rules/part5_protests_redress/section_c_misconduct/preamble.md', type: 'rule' },
        children: [
          { id: 'rule_69', title: 'Rule 69 — Misconduct',                 path: '/rules/part5_protests_redress/section_c_misconduct/rule_69_misconduct.md', type: 'rule' },
        ],
      },
      {
        id: 'part5_sec_d',
        title: 'Section D — Appeals',
        type: 'section',
        preamble: { id: 'part5_sec_d_preamble', title: 'Preamble', path: '/rules/part5_protests_redress/section_d_appeals/preamble.md', type: 'rule' },
        children: [
          { id: 'rule_70', title: 'Rule 70 — Appeals and Requests to a National Authority', path: '/rules/part5_protests_redress/section_d_appeals/rule_70_appeals_and_requests_to_a_national_authority.md', type: 'rule' },
          { id: 'rule_71', title: 'Rule 71 — National Authority Decisions', path: '/rules/part5_protests_redress/section_d_appeals/rule_71_national_authority_decisions.md', type: 'rule' },
          { id: 'rule_72', title: 'Rule 72 — Interpretations',            path: '/rules/part5_protests_redress/section_d_appeals/rule_72_interpretations.md',               type: 'rule' },
        ],
      },
    ],
  },

  // ── Part 6 ────────────────────────────────────────────────────────
  {
    id: 'part6',
    title: 'Part 6 — Entry and Qualification',
    type: 'part',
    preamble: { id: 'part6_preamble', title: 'Preamble', path: '/rules/part6_entry_qualification/preamble.md', type: 'rule' },
    children: [
      { id: 'rule_75', title: 'Rule 75 — Entering an Event',             path: '/rules/part6_entry_qualification/rule_75_entering_an_event.md',                     type: 'rule' },
      { id: 'rule_76', title: 'Rule 76 — Exclusion of Boats or Competitors', path: '/rules/part6_entry_qualification/rule_76_exclusion_of_boats_or_competitors.md', type: 'rule' },
      { id: 'rule_77', title: 'Rule 77 — Identification on Sails',       path: '/rules/part6_entry_qualification/rule_77_identification_on_sails.md',               type: 'rule' },
      { id: 'rule_78', title: 'Rule 78 — Compliance with Class Rules; Certificates', path: '/rules/part6_entry_qualification/rule_78_compliance_with_class_rules_certificates.md', type: 'rule' },
      { id: 'rule_79', title: 'Rule 79 — Categorization',                path: '/rules/part6_entry_qualification/rule_79_categorization.md',                        type: 'rule' },
      { id: 'rule_80', title: 'Rule 80 — Rescheduled Event',             path: '/rules/part6_entry_qualification/rule_80_rescheduled_event.md',                     type: 'rule' },
    ],
  },

  // ── Part 7 ────────────────────────────────────────────────────────
  {
    id: 'part7',
    title: 'Part 7 — Event Organization',
    type: 'part',
    preamble: { id: 'part7_preamble', title: 'Preamble', path: '/rules/part7_event_organization/preamble.md', type: 'rule' },
    children: [
      { id: 'rule_85', title: 'Rule 85 — Changes to Rules',             path: '/rules/part7_event_organization/rule_85_changes_to_rules.md',                               type: 'rule' },
      { id: 'rule_86', title: 'Rule 86 — Changes to the Racing Rules',  path: '/rules/part7_event_organization/rule_86_changes_to_the_racing_rules.md',                    type: 'rule' },
      { id: 'rule_87', title: 'Rule 87 — Changes to Class Rules',       path: '/rules/part7_event_organization/rule_87_changes_to_class_rules.md',                         type: 'rule' },
      { id: 'rule_88', title: 'Rule 88 — National Prescriptions',       path: '/rules/part7_event_organization/rule_88_national_prescriptions.md',                         type: 'rule' },
      { id: 'rule_89', title: 'Rule 89 — Organizing Authority; Notice of Race', path: '/rules/part7_event_organization/rule_89_organizing_authority_notice_of_race.md',   type: 'rule' },
      { id: 'rule_90', title: 'Rule 90 — Race Committee; Sailing Instructions; Scoring', path: '/rules/part7_event_organization/rule_90_race_committee_sailing_instructions_scoring.md', type: 'rule' },
      { id: 'rule_91', title: 'Rule 91 — Protest Committee',            path: '/rules/part7_event_organization/rule_91_protest_committee.md',                             type: 'rule' },
      { id: 'rule_92', title: 'Rule 92 — Technical Committee',          path: '/rules/part7_event_organization/rule_92_technical_committee.md',                           type: 'rule' },
    ],
  },

  // ── Appendices ────────────────────────────────────────────────────
  {
    id: 'appendices',
    title: 'Appendices',
    type: 'part',
    children: [
      { id: 'appendix_a', title: 'Appendix A — Scoring',                            path: '/rules/appendices/appendix_a_scoring.md',                                      type: 'rule' },
      { id: 'appendix_b', title: 'Appendix B — Windsurfing Fleet Racing Rules',     path: '/rules/appendices/appendix_b_windsurfing_fleet_racing_rules.md',               type: 'rule' },
      { id: 'appendix_c', title: 'Appendix C — Match Racing Rules',                 path: '/rules/appendices/appendix_c_match_racing_rules.md',                           type: 'rule' },
      { id: 'appendix_d', title: 'Appendix D — Team Racing Rules',                  path: '/rules/appendices/appendix_d_team_racing_rules.md',                            type: 'rule' },
      { id: 'appendix_e', title: 'Appendix E — Radio Sailing Racing Rules',         path: '/rules/appendices/appendix_e_radio_sailing_racing_rules.md',                   type: 'rule' },
      { id: 'appendix_f', title: 'Appendix F — Kiteboarding Racing Rules',          path: '/rules/appendices/appendix_f_kiteboarding_racing_rules.md',                    type: 'rule' },
      { id: 'appendix_g', title: 'Appendix G — Identification on Sails',            path: '/rules/appendices/appendix_g_identification_on_sails.md',                      type: 'rule' },
      { id: 'appendix_j', title: 'Appendix J — Notice of Race and Sailing Instructions', path: '/rules/appendices/appendix_j_notice_of_race_and_sailing_instructions.md', type: 'rule' },
      { id: 'appendix_m', title: 'Appendix M — Recommendations for Protest Committees', path: '/rules/appendices/appendix_m_recommendations_for_protest_committees.md',   type: 'rule' },
      { id: 'appendix_n', title: 'Appendix N — International Juries',               path: '/rules/appendices/appendix_n_international_juries.md',                         type: 'rule' },
      { id: 'appendix_p', title: 'Appendix P — Special Procedures for Rule 42',     path: '/rules/appendices/appendix_p_special_procedures_for_rule_42.md',               type: 'rule' },
      { id: 'appendix_r', title: 'Appendix R — Procedures for Appeals and Requests', path: '/rules/appendices/appendix_r_procedures_for_appeals_and_requests.md',         type: 'rule' },
      { id: 'appendix_s', title: 'Appendix S — Standard Sailing Instructions',      path: '/rules/appendices/appendix_s_standard_sailing_instructions.md',                type: 'rule' },
      { id: 'appendix_t', title: 'Appendix T — Arbitration',                        path: '/rules/appendices/appendix_t_arbitration.md',                                  type: 'rule' },
    ],
  },

  // ── Race Signals ──────────────────────────────────────────────────
  {
    id: 'race_signals',
    title: 'Race Signals',
    type: 'standalone',
    path: '/rules/race_signals/race_signals.md',
  },
]

// ── Helpers ───────────────────────────────────────────────────────────

/** Recursively collect all loadable items (has .path) into a flat array. */
function flattenIndex(items: RuleNode[], acc: RuleLeaf[] = []): RuleLeaf[] {
  for (const item of items) {
    if ('path' in item) acc.push(item)
    if ('preamble' in item && item.preamble) flattenIndex([item.preamble], acc)
    if ('children' in item) flattenIndex(item.children, acc)
  }
  return acc
}

/** O(1) lookup map: id → { id, title, path } */
export const RULES_BY_ID: Record<string, RuleLeaf> = Object.fromEntries(
  flattenIndex(RULES_INDEX).map(item => [item.id, item])
)

/** Flat list of leaf rules/standalones for search (excludes preambles). */
export const FLAT_SEARCH_LIST: RuleLeaf[] = flattenIndex(RULES_INDEX).filter(
  item => item.type === 'rule' || item.type === 'standalone'
)

/**
 * Given a rule id, return the id of the part that contains it
 * (so we can auto-expand when a search result is selected).
 */
export function findParentPartId(targetId: string): string | null {
  for (const node of RULES_INDEX) {
    if (!('children' in node)) continue
    if (_containsId(node, targetId)) return node.id
  }
  return null
}

function _containsId(node: RuleNode, targetId: string): boolean {
  if (node.id === targetId) return true
  if ('preamble' in node && node.preamble && node.preamble.id === targetId) return true
  if ('children' in node) {
    for (const child of node.children) {
      if (_containsId(child, targetId)) return true
    }
  }
  return false
}
