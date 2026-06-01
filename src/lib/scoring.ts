import { Dimension } from "@/data/survey";

export interface DimensionScore {
  id: string;
  name: string;
  average: number; // 0 when sin respuestas
  answered: number;
  total: number;
}

export interface SurveyResult {
  dimensionScores: DimensionScore[];
  overallAverage: number;
  totalAnswered: number;
  totalQuestions: number;
  level: ComplianceLevel;
}

export interface ComplianceLevel {
  label: string;
  description: string;
  color: string;
}

export function getComplianceLevel(score: number): ComplianceLevel {
  if (score <= 0) {
    return {
      label: "Sin evaluar",
      description: "Responde la encuesta para obtener tu nivel de cumplimiento.",
      color: "#a1a1aa",
    };
  }
  if (score < 2) {
    return {
      label: "Crítico",
      description:
        "El cumplimiento es muy bajo. Se requieren acciones urgentes para alinearse con la Ley N° 21.719.",
      color: "#dc2626",
    };
  }
  if (score < 3) {
    return {
      label: "Inicial",
      description:
        "Existen bases mínimas, pero hay brechas importantes que atender de forma prioritaria.",
      color: "#ea580c",
    };
  }
  if (score < 4) {
    return {
      label: "Intermedio",
      description:
        "El cumplimiento es razonable. Conviene reforzar las dimensiones más débiles.",
      color: "#ca8a04",
    };
  }
  if (score < 4.5) {
    return {
      label: "Avanzado",
      description:
        "Buen nivel de cumplimiento. Mantén la mejora continua y la documentación al día.",
      color: "#16a34a",
    };
  }
  return {
    label: "Óptimo",
    description:
      "Cumplimiento sobresaliente con la Ley N° 21.719. Enfócate en sostener y auditar.",
    color: "#d1ec51",
  };
}

export function computeResult(
  dimensions: Dimension[],
  answers: Record<string, number>
): SurveyResult {
  const dimensionScores: DimensionScore[] = dimensions.map((dim) => {
    const values = dim.questions
      .map((q) => answers[q.id])
      .filter((v): v is number => typeof v === "number" && v > 0);

    const average =
      values.length > 0
        ? values.reduce((a, b) => a + b, 0) / values.length
        : 0;

    return {
      id: dim.id,
      name: dim.name,
      average,
      answered: values.length,
      total: dim.questions.length,
    };
  });

  const allValues = dimensions
    .flatMap((d) => d.questions)
    .map((q) => answers[q.id])
    .filter((v): v is number => typeof v === "number" && v > 0);

  const overallAverage =
    allValues.length > 0
      ? allValues.reduce((a, b) => a + b, 0) / allValues.length
      : 0;

  const totalQuestions = dimensions.reduce(
    (acc, d) => acc + d.questions.length,
    0
  );

  return {
    dimensionScores,
    overallAverage,
    totalAnswered: allValues.length,
    totalQuestions,
    level: getComplianceLevel(overallAverage),
  };
}
