import cron from "node-cron";
import db from "../../config/database";

// 1er janvier à minuit → messes annuelles
cron.schedule("0 0 1 1 *", async () => {
  console.log("⏳ Job annuel : affecter les messes annuelles…");
  await assignAnnualMasses();
});

// 1er de chaque mois à minuit → messes mensuelles
cron.schedule("0 0 1 * *", async () => {
  console.log("⏳ Job mensuel : affecter les messes mensuelles…");
  await assignMonthlyMasses();
});

// ---- LOGIQUE ----

// Messes annuelles (month NULL)
async function assignAnnualMasses() {
  const intentions = await db("Intentions")
    .whereNull("month")
    .andWhere("recurrence_type", "annual");

  const nextYear = new Date().getFullYear() + 1;

  for (const intent of intentions) {
    for (let month = 1; month <= 12; month++) {
      const date = `${nextYear}-${String(month).padStart(2, "0")}-01`;

      const exists = await db("Masses")
        .where("intention_id", intent.id)
        .andWhere("date", date)
        .first();

      if (!exists) {
        await db("Masses").insert({
          intention_id: intent.id,
          date,
          celebrant_id: intent.celebrant_id || null,
        });
      }
    }
  }
  console.log(`✅ ${intentions.length} intentions annuelles traitées`);
}

// Messes mensuelles (month NOT NULL)
async function assignMonthlyMasses() {
  const intentions = await db("Intentions")
    .whereNotNull("month")
    .andWhere("recurrence_type", "monthly");

  const nextYear = new Date().getFullYear() + 1;

  for (const intent of intentions) {
    const month = String(intent.month).padStart(2, "0");
    const date = `${nextYear}-${month}-01`;

    const exists = await db("Masses")
      .where("intention_id", intent.id)
      .andWhere("date", date)
      .first();

    if (!exists) {
      await db("Masses").insert({
        intention_id: intent.id,
        date,
        celebrant_id: intent.celebrant_id || null,
      });
    }
  }
  console.log(`✅ ${intentions.length} intentions mensuelles traitées`);
}
