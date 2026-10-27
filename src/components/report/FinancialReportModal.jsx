import { useState, useEffect } from "react";
import {
  X,
  Printer,
  Loader2,
  DollarSign,
  TrendingUp,
  TrendingDown,
  PieChart,
  Building2,
  Percent
} from "lucide-react";
import PropTypes from "prop-types";
import ReportService from "../../services/ReportService";
import SettingsService from "../../services/settings";
import { getLogoUrl } from "../../utils/localImageService";

const formatDateParam = (isoString) => {
  if (!isoString) return "";
  return isoString.slice(0, 10);
};

const formatCurrency = (value) => {
  const num = parseFloat(value) || 0;
  return `₦${num.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
};

const FinancialReportModal = ({ isOpen, onClose, dateRange }) => {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [profitData, setProfitData] = useState(null);
  const [orgProfile, setOrgProfile] = useState(null);

  useEffect(() => {
    if (!isOpen) return;
    const fetchData = async () => {
      setLoading(true);
      setError(null);
      try {
        const profile = await SettingsService.Profile.getProfile();
        setOrgProfile(profile);
      } catch {
        /* ignore */
      }
      try {
        const params = {};
        if (dateRange.startDate) {
          params.start_date = formatDateParam(dateRange.startDate);
        }
        if (dateRange.endDate) {
          params.end_date = formatDateParam(dateRange.endDate);
        }
        const data = await ReportService.getProfitReport(params);
        setProfitData(data);
      } catch (err) {
        console.error("Error fetching profit report:", err);
        setError("Failed to load financial report data.");
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, [isOpen, dateRange]);

  const handlePrint = () => {
    window.print();
  };

  if (!isOpen) return null;

  const periodLabel = dateRange.label || "All Time";

  return (
    <>
      <style>{`
        @media print {
          body * {
            visibility: hidden;
          }
          #financial-report-content,
          #financial-report-content * {
            visibility: visible;
          }
          #financial-report-content {
            position: fixed;
            left: 0;
            top: 0;
            width: 100%;
            height: 100%;
            overflow: auto;
            background: white;
            padding: 40px;
          }
          .no-print {
            display: none !important;
          }
          .print-only {
            display: block !important;
          }
          .print-break-inside {
            break-inside: avoid;
          }
        }
        @media screen {
          .print-only {
            display: none !important;
          }
        }
      `}</style>
      <div className="fixed inset-0 z-50 overflow-y-auto">
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm no-print" onClick={onClose} />
        <div className="relative min-h-screen flex items-center justify-center p-4">
          <div
            id="financial-report-content"
            className="relative bg-white rounded-2xl shadow-2xl w-full max-w-4xl max-h-[90vh] overflow-y-auto"
          >
            {/* Header Controls */}
            <div className="sticky top-0 bg-white border-b border-gray-200 px-8 py-4 flex items-center justify-between no-print z-10">
              <h2 className="text-xl font-bold text-gray-900">Financial Report</h2>
              <div className="flex gap-2">
                <button
                  onClick={handlePrint}
                  className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors font-medium"
                >
                  <Printer className="w-4 h-4" />
                  Print
                </button>
                <button
                  onClick={onClose}
                  className="p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-lg transition-colors"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>
            </div>

            {loading ? (
              <div className="flex flex-col items-center justify-center py-24">
                <Loader2 className="w-10 h-10 animate-spin text-blue-600 mb-4" />
                <p className="text-gray-600 text-lg">Generating financial report...</p>
              </div>
            ) : error ? (
              <div className="text-center py-24">
                <p className="text-red-500 text-lg mb-2">{error}</p>
                <button
                  onClick={onClose}
                  className="px-4 py-2 bg-gray-200 rounded-lg hover:bg-gray-300"
                >
                  Close
                </button>
              </div>
            ) : (
              <div className="p-8">
                {/* Org Header */}
                <div className="flex items-center gap-4 mb-8 pb-6 border-b-2 border-gray-200">
                  {orgProfile?.logo_url ? (
                    <img
                      src={getLogoUrl(orgProfile.logo_url)}
                      alt="Logo"
                      className="w-16 h-16 object-contain rounded-lg"
                    />
                  ) : (
                    <div className="w-16 h-16 bg-blue-100 rounded-lg flex items-center justify-center">
                      <Building2 className="w-8 h-8 text-blue-600" />
                    </div>
                  )}
                  <div>
                    <h1 className="text-2xl font-bold text-gray-900">
                      {orgProfile?.business_name || "Business Name"}
                    </h1>
                    <p className="text-gray-500">
                      Financial Report &mdash; {periodLabel}
                    </p>
                  </div>
                </div>

                {/* Period Summary */}
                <div className="mb-8">
                  <p className="text-sm text-gray-500">
                    Reporting Period: <span className="font-semibold text-gray-700">{profitData?.period || periodLabel}</span>
                  </p>
                </div>

                {/* Financial Summary Cards */}
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
                  <div className="bg-green-50 border-2 border-green-200 rounded-2xl p-6 print-break-inside">
                    <div className="flex items-center gap-3 mb-3">
                      <div className="p-2 bg-green-100 rounded-xl">
                        <TrendingUp className="w-6 h-6 text-green-700" />
                      </div>
                      <h3 className="font-semibold text-gray-700">Revenue</h3>
                    </div>
                    <p className="text-3xl font-bold text-green-700">
                      {formatCurrency(profitData?.revenue || 0)}
                    </p>
                  </div>

                  <div className="bg-red-50 border-2 border-red-200 rounded-2xl p-6 print-break-inside">
                    <div className="flex items-center gap-3 mb-3">
                      <div className="p-2 bg-red-100 rounded-xl">
                        <TrendingDown className="w-6 h-6 text-red-700" />
                      </div>
                      <h3 className="font-semibold text-gray-700">Expenditure</h3>
                    </div>
                    <p className="text-3xl font-bold text-red-700">
                      {formatCurrency(
                        (parseFloat(profitData?.cost_of_goods_sold || 0) +
                          parseFloat(profitData?.operating_expenses || 0)).toString()
                      )}
                    </p>
                    <div className="mt-2 text-sm text-gray-500 space-y-1">
                      <div className="flex justify-between">
                        <span>COGS</span>
                        <span className="font-medium">{formatCurrency(profitData?.cost_of_goods_sold || 0)}</span>
                      </div>
                      <div className="flex justify-between">
                        <span>Operating</span>
                        <span className="font-medium">{formatCurrency(profitData?.operating_expenses || 0)}</span>
                      </div>
                    </div>
                  </div>

                  <div className="bg-blue-50 border-2 border-blue-200 rounded-2xl p-6 print-break-inside">
                    <div className="flex items-center gap-3 mb-3">
                      <div className="p-2 bg-blue-100 rounded-xl">
                        <DollarSign className="w-6 h-6 text-blue-700" />
                      </div>
                      <h3 className="font-semibold text-gray-700">Gross Profit</h3>
                    </div>
                    <p className="text-3xl font-bold text-blue-700">
                      {formatCurrency(profitData?.gross_profit || 0)}
                    </p>
                  </div>

                  <div className="bg-purple-50 border-2 border-purple-200 rounded-2xl p-6 print-break-inside">
                    <div className="flex items-center gap-3 mb-3">
                      <div className="p-2 bg-purple-100 rounded-xl">
                        <Percent className="w-6 h-6 text-purple-700" />
                      </div>
                      <h3 className="font-semibold text-gray-700">Net Profit</h3>
                    </div>
                    <p className="text-3xl font-bold text-purple-700">
                      {formatCurrency(profitData?.net_profit || 0)}
                    </p>
                  </div>
                </div>

                {/* Detailed Breakdown Table */}
                <div className="bg-white border-2 border-gray-100 rounded-2xl overflow-hidden print-break-inside">
                  <div className="px-6 py-4 bg-gray-50 border-b border-gray-100 flex items-center gap-2">
                    <PieChart className="w-5 h-5 text-gray-600" />
                    <h3 className="font-semibold text-gray-700">Detailed Breakdown</h3>
                  </div>
                  <table className="w-full">
                    <thead className="bg-gray-50 border-b border-gray-100">
                      <tr>
                        <th className="text-left p-4 font-semibold text-gray-700 text-sm uppercase tracking-wider">Metric</th>
                        <th className="text-right p-4 font-semibold text-gray-700 text-sm uppercase tracking-wider">Amount</th>
                        <th className="text-right p-4 font-semibold text-gray-700 text-sm uppercase tracking-wider">Margin</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-100">
                      <tr className="hover:bg-gray-50">
                        <td className="p-4 font-medium text-gray-900">Gross Revenue</td>
                        <td className="p-4 text-right font-semibold text-green-600">{formatCurrency(profitData?.revenue || 0)}</td>
                        <td className="p-4 text-right text-gray-500">100%</td>
                      </tr>
                      <tr className="hover:bg-gray-50">
                        <td className="p-4 font-medium text-gray-900">Cost of Goods Sold</td>
                        <td className="p-4 text-right font-semibold text-red-600">{formatCurrency(profitData?.cost_of_goods_sold || 0)}</td>
                        <td className="p-4 text-right text-gray-500">&mdash;</td>
                      </tr>
                      <tr className="hover:bg-gray-50 bg-gray-50/50">
                        <td className="p-4 font-semibold text-gray-900">Gross Profit</td>
                        <td className="p-4 text-right font-bold text-gray-900">{formatCurrency(profitData?.gross_profit || 0)}</td>
                        <td className="p-4 text-right font-medium text-gray-700">
                          {profitData?.gross_margin != null ? `${profitData.gross_margin.toFixed(1)}%` : "&mdash;"}
                        </td>
                      </tr>
                      <tr className="hover:bg-gray-50">
                        <td className="p-4 font-medium text-gray-900">Operating Expenses</td>
                        <td className="p-4 text-right font-semibold text-red-600">{formatCurrency(profitData?.operating_expenses || 0)}</td>
                        <td className="p-4 text-right text-gray-500">&mdash;</td>
                      </tr>
                      <tr className="hover:bg-gray-50 bg-blue-50/50 border-t-2 border-blue-200">
                        <td className="p-4 font-bold text-gray-900">Net Profit</td>
                        <td className="p-4 text-right font-bold text-blue-700">{formatCurrency(profitData?.net_profit || 0)}</td>
                        <td className="p-4 text-right font-bold text-gray-700">
                          {profitData?.net_margin != null ? `${profitData.net_margin.toFixed(1)}%` : "&mdash;"}
                        </td>
                      </tr>
                    </tbody>
                  </table>
                </div>

                {/* Footer */}
                <div className="mt-8 pt-6 border-t border-gray-200 text-center text-sm text-gray-400 print-only">
                  <p>Generated on {new Date().toLocaleDateString()} at {new Date().toLocaleTimeString()}</p>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </>
  );
};

FinancialReportModal.propTypes = {
  isOpen: PropTypes.bool.isRequired,
  onClose: PropTypes.func.isRequired,
  dateRange: PropTypes.shape({
    startDate: PropTypes.string,
    endDate: PropTypes.string,
    label: PropTypes.string,
  }).isRequired,
};

export default FinancialReportModal;
