import DoseCalculator, { type OarContext } from './DoseCalculator';

type DoseCalculatorPageProps = {
  searchParams: Promise<{ [key: string]: string | string[] | undefined }>;
};

export default async function DoseCalculatorPage({ searchParams }: DoseCalculatorPageProps) {
  const params = await searchParams;
  const [organ, metric, limit, fractionation] = ['organ', 'metric', 'limit', 'fractionation'].map(key => params[key]);
  const initialOarContext: OarContext | null =
    typeof organ === 'string'
    && typeof metric === 'string'
    && typeof limit === 'string'
    && typeof fractionation === 'string'
      ? { organ, metric, limit, fractionation }
      : null;

  return <DoseCalculator initialOarContext={initialOarContext} />;
}
