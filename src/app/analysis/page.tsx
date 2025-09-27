import PageHeader from "@/components/page-header";
import { ProfitLossCalculator } from "./profit-loss-calculator";

export default function AnalysisPage() {
  return (
    <>
      <PageHeader
        title="Profit / Loss Analysis"
        description="Calculate daily profit or loss using our AI-powered tool."
      />
      <div className="grid gap-4 md:gap-8">
        <ProfitLossCalculator />
      </div>
    </>
  );
}
