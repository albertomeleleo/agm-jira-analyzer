export interface ReleaseNote {
  version: string
  date: string
  type: string
  summary: string
  features: {
    id: string
    title: string
    description: string
    impact: string
  }[]
  bugfixes: {
    id: string
    title: string
    problem: string
    solution: string
    impact: string
  }[]
  improvements: {
    title: string
    description: string
  }[]
}

export const RELEASE_NOTES: ReleaseNote[] = [
  {
    version: '1.1.0',
    date: '2026-02-09',
    type: 'Minor Release',
    summary:
      'Questa release introduce significativi miglioramenti al sistema di monitoraggio SLA, con particolare attenzione alla gestione delle issue rifiutate, al tracciamento delle dipendenze e al supporto per la localizzazione italiana.',
    features: [
      {
        id: 'CR-001',
        title: 'Tracciamento Tempo in Dipendenza',
        description:
          'Implementato il tracciamento separato del tempo trascorso in stati di dipendenza esterna (Dipendenza GNV, Dipendenza Adesso.it, qualsiasi stato "Dipendenza *").',
        impact:
          'Gli utenti possono ora vedere chiaramente quanto tempo ogni issue è rimasta bloccata in attesa di dipendenze esterne, separato dalle altre pause.'
      },
      {
        id: 'CR-002',
        title: 'Tracciamento Tempo in Giorni Non Lavorativi',
        description:
          'Implementato il calcolo del tempo trascorso durante weekend e festività italiane (11 festività nazionali riconosciute automaticamente).',
        impact:
          'Visibilità completa del tempo trascorso in giorni non lavorativi, utile per analisi di performance e reportistica.'
      }
    ],
    bugfixes: [
      {
        id: 'BUG-001',
        title: 'Esclusione Issue Rifiutate dal Calcolo SLA',
        problem:
          'Le issue con stato "Rejected", "Won\'t Fix", o "Cancelled" venivano incluse nel calcolo delle SLA missed, falsando le metriche di compliance.',
        solution:
          'Le issue rifiutate ora non hanno calcolo SLA (reactionSLAMet = null, resolutionSLAMet = null) e sono conteggiate separatamente nelle metriche.',
        impact:
          'Metriche SLA ora riflettono accuratamente solo le issue attive, escludendo quelle rifiutate.'
      },
      {
        id: 'BUG-002',
        title: 'Supporto Campo "Motivo Impedimento"',
        problem:
          'Le transizioni di stato registrate nel campo custom "Motivo Impedimento" non venivano rilevate nel calcolo dei segmenti SLA.',
        solution:
          'Aggiornata la funzione extractStatusTransitions() per rilevare transizioni anche dal campo "Motivo Impedimento" oltre al campo standard "status".',
        impact:
          'Tracciamento completo di tutte le transizioni di stato, indipendentemente dal campo utilizzato in Jira.'
      }
    ],
    improvements: [
      {
        title: 'Localizzazione Italiana - Utilities Base',
        description:
          'Preparazione infrastruttura per localizzazione completa dell\'interfaccia con mappature stato/priorità (es: Done → Completata, Critical → Critico).'
      },
      {
        title: 'Ordinamento Logico Priorità',
        description:
          'Implementato ordinamento basato su gerarchia logica (Critical > High > Medium > Low > Lowest) invece che alfabetico.'
      }
    ]
  }
]
