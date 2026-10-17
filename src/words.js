// London Insurance Market word list for Risky Word.
// Each entry's `word` must be uppercase A-Z only, length 5-12.
export const WORDS = [
  {
    word: 'BINDER',
    definition:
      'A temporary agreement giving evidence of insurance cover, put in place until the full policy is issued.',
  },
  {
    word: 'LINESLIP',
    definition:
      'An agreement used at Lloyd’s allowing a broker to place a risk with a group of underwriters under agreed terms.',
  },
  {
    word: 'FACULTATIVE',
    definition:
      'Reinsurance placed for a single, specific risk, negotiated separately rather than under a standing treaty.',
  },
  {
    word: 'SYNDICATE',
    definition:
      'A group of underwriting members, often at Lloyd’s, who pool capital and capacity to accept insurance risk.',
  },
  {
    word: 'UNDERWRITER',
    definition:
      'The individual who assesses and accepts risk on behalf of an insurer, deciding terms and pricing.',
  },
  {
    word: 'COVERHOLDER',
    definition:
      'A company authorised by a Lloyd’s managing agent to enter into contracts of insurance on its behalf.',
  },
  {
    word: 'AGGREGATE',
    definition:
      'The total amount an insurer will pay for all claims within a policy period, capping cumulative exposure.',
  },
  {
    word: 'SUBROGATION',
    definition:
      'The insurer’s right, after paying a claim, to pursue a third party responsible for the loss.',
  },
  {
    word: 'SANCTIONS',
    definition:
      'Legal restrictions imposed by governments or bodies that insurers must screen for before providing cover.',
  },
  {
    word: 'REINSURANCE',
    definition:
      'Insurance bought by an insurer to transfer part of its own risk to another insurer.',
  },
  {
    word: 'EXCESS',
    definition:
      'The amount of a claim the policyholder must bear before the insurer’s liability begins.',
  },
  {
    word: 'TREATY',
    definition:
      'A standing reinsurance agreement covering a whole category of business automatically, rather than risk by risk.',
  },
  {
    word: 'PLACING',
    definition:
      'The process of a broker arranging cover for a client by presenting the risk to underwriters.',
  },
  {
    word: 'PREMIUM',
    definition:
      'The amount paid by a policyholder to an insurer in exchange for cover.',
  },
  {
    word: 'LIABILITY',
    definition:
      'Legal responsibility for injury or damage to a third party, and the class of insurance covering it.',
  },
  {
    word: 'EXPOSURE',
    definition:
      'The extent to which an insured or insurer is subject to the risk of financial loss.',
  },
  {
    word: 'CAPACITY',
    definition:
      'The maximum amount of risk an insurer or the market is able or willing to underwrite.',
  },
  {
    word: 'RETENTION',
    definition:
      'The portion of risk an insurer or insured keeps for its own account rather than transferring it.',
  },
  {
    word: 'BORDEREAUX',
    definition:
      'A detailed report, usually from a coverholder or MGA, listing premiums, claims or exposures.',
  },
  {
    word: 'CEDENT',
    definition:
      'An insurer that passes some of its risk to a reinsurer under a reinsurance contract.',
  },
  {
    word: 'INDEMNITY',
    definition:
      'The principle of restoring a policyholder to the same financial position they were in before a loss.',
  },
  {
    word: 'ENDORSEMENT',
    definition:
      'A document that amends the terms, conditions or cover of an existing insurance policy.',
  },
  {
    word: 'DEDUCTIBLE',
    definition:
      'A set amount deducted from a claim payment, borne by the insured before the insurer pays the balance.',
  },
  {
    word: 'ARBITRATION',
    definition:
      'A formal process for resolving disputes between parties to a policy outside of the court system.',
  },
  {
    word: 'CATASTROPHE',
    definition:
      'A severe, often large-scale event causing significant insured losses, such as a hurricane or earthquake.',
  },
  {
    word: 'RETROCESSION',
    definition:
      'Reinsurance purchased by a reinsurer to transfer part of the risk it has itself assumed.',
  },
  {
    word: 'FRANCHISE',
    definition:
      'A policy clause under which the insurer pays nothing until a loss exceeds a set threshold, then pays in full.',
  },
  {
    word: 'ADJUSTER',
    definition:
      'A professional who investigates and assesses insurance claims to determine the insurer’s liability.',
  },
  {
    word: 'PERIL',
    definition:
      'A specific cause of loss, such as fire or flood, that a policy may cover or exclude.',
  },
  {
    word: 'DISCLOSURE',
    definition:
      'The duty of a proposer to reveal all material facts relevant to an insurer’s assessment of a risk.',
  },
]

export const MIN_WORD_LENGTH = Math.min(...WORDS.map((entry) => entry.word.length))
export const MAX_WORD_LENGTH = Math.max(...WORDS.map((entry) => entry.word.length))
