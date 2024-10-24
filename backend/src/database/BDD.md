### Table `Masses`
| Champ            | Type         | Description                              |
|------------------|--------------|------------------------------------------|
| `id`             | `INT`        | Identifiant unique de la messe (PK)     |
| `date`           | `DATETIME`   | Date et heure de la messe                |
| `celebrant_id`   | `INT`        | Identifiant du célébrant (FK)           |
| `intention_id`   | `INT`        | Identifiant de l'intention (FK)         |
| `status`         | `ENUM`       | Statut de la messe (programmée, annulée, etc.) |

---

### Table `Intentions`
| Champ            | Type         | Description                              |
|------------------|--------------|------------------------------------------|
| `id`             | `INT`        | Identifiant unique de l'intention (PK)  |
| `description`    | `TEXT`       | Description de l'intention               |
| `amount`         | `DECIMAL`    | Montant de l'offrande                    |
| `donor_id`       | `INT`        | Identifiant du donateur (FK)            |
| `date_requested` | `DATETIME`   | Date à laquelle l'intention a été demandée |

---

### Table `Donors`
| Champ            | Type         | Description                              |
|------------------|--------------|------------------------------------------|
| `id`             | `INT`        | Identifiant unique du donateur (PK)     |
| `name`           | `VARCHAR(100)`| Nom du donateur                          |
| `email`          | `VARCHAR(100)`| Adresse email du donateur                |
| `phone`          | `VARCHAR(20)` | Numéro de téléphone                      |
| `address`        | `VARCHAR(255)`| Adresse du donateur                      |
| `wants_notification`| `BOOLEAN` | Indique si le donateur souhaite être notifié de la date de la messe |

---

### Table `Celebrants`
| Champ            | Type         | Description                              |
|------------------|--------------|------------------------------------------|
| `id`             | `INT`        | Identifiant unique du célébrant (PK)    |
| `name`           | `VARCHAR(100)`| Nom du célébrant                        |
| `email`          | `VARCHAR(100)`| Adresse email du célébrant               |
| `is_available`   | `BOOLEAN`    | Indique si le célébrant est disponible  |

---

### Table `SpecialDays`
| Champ            | Type         | Description                              |
|------------------|--------------|------------------------------------------|
| `id`             | `INT`        | Identifiant unique du jour spécial (PK) |
| `date`           | `DATE`       | Date du jour spécial                     |
| `note`           | `TEXT`       | Notes sur le jour spécial (ex: Pâques)  |
| `number_of_masses` | `INT`      | Nombre de messes programmées pour ce jour|