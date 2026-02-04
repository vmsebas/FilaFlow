import { useList } from "@refinedev/core";
import { Card, Progress, Row, Col, Typography, Tag, Empty, Spin } from "antd";
import { 
  DatabaseOutlined, 
  ExperimentOutlined,
  ShopOutlined,
  PlusOutlined 
} from "@ant-design/icons";
import { Link, useNavigate } from "react-router";
import "./modernDashboard.css";

const { Title, Text } = Typography;

interface Spool {
  id: number;
  filament: {
    id: number;
    name: string;
    material: string;
    color_hex: string;
    vendor?: {
      name: string;
    };
  };
  remaining_weight: number;
  initial_weight: number;
  location?: string;
}

const SpoolCard = ({ spool }: { spool: Spool }) => {
  const remaining = spool.remaining_weight || 0;
  const initial = spool.initial_weight || 1000;
  const percent = Math.round((remaining / initial) * 100);
  const colorHex = spool.filament?.color_hex || "808080";
  
  const getStatusColor = (pct: number) => {
    if (pct > 50) return "#52c41a";
    if (pct > 20) return "#faad14";
    return "#ff4d4f";
  };

  return (
    <Card 
      className="spool-card"
      style={{ 
        borderLeft: `4px solid #${colorHex}`,
        marginBottom: 12
      }}
    >
      <div className="spool-card-content">
        <div 
          className="spool-color-indicator"
          style={{ backgroundColor: `#${colorHex}` }}
        />
        <div className="spool-info">
          <Text strong className="spool-name">
            {spool.filament?.name || "Sin nombre"}
          </Text>
          <Text type="secondary" className="spool-material">
            {spool.filament?.material} • {spool.filament?.vendor?.name}
          </Text>
          <div className="spool-progress">
            <Progress 
              percent={percent} 
              size="small"
              strokeColor={getStatusColor(percent)}
              format={() => `${remaining}g`}
            />
          </div>
        </div>
      </div>
    </Card>
  );
};

const StatCard = ({ 
  title, 
  value, 
  icon, 
  color,
  onClick 
}: { 
  title: string; 
  value: number; 
  icon: React.ReactNode;
  color: string;
  onClick?: () => void;
}) => (
  <Card 
    className="stat-card" 
    onClick={onClick}
    style={{ cursor: onClick ? "pointer" : "default" }}
  >
    <div className="stat-icon" style={{ backgroundColor: color }}>
      {icon}
    </div>
    <div className="stat-content">
      <Text className="stat-value">{value}</Text>
      <Text type="secondary" className="stat-title">{title}</Text>
    </div>
  </Card>
);

export const ModernDashboard = () => {
  const navigate = useNavigate();
  
  const { result: spoolsResult, query: spoolsQuery } = useList<Spool>({
    resource: "spool",
    pagination: { mode: "off" },
  });

  const { result: filamentsResult } = useList({
    resource: "filament",
    pagination: { mode: "off" },
  });

  const { result: vendorsResult } = useList({
    resource: "vendor",
    pagination: { mode: "off" },
  });

  const spoolsLoading = spoolsQuery.isLoading;
  const spools: Spool[] = spoolsResult?.data || [];
  const filaments = filamentsResult?.data || [];
  const vendors = vendorsResult?.data || [];

  // Calculate stats
  const totalWeight = spools.reduce((sum: number, s: Spool) => sum + (s.remaining_weight || 0), 0);
  const lowStockSpools = spools.filter((s: Spool) => {
    const pct = ((s.remaining_weight || 0) / (s.initial_weight || 1000)) * 100;
    return pct < 20;
  });

  // Group spools by material
  const spoolsByMaterial = spools.reduce((acc: Record<string, Spool[]>, spool: Spool) => {
    const material = spool.filament?.material || "Otro";
    if (!acc[material]) acc[material] = [];
    acc[material].push(spool);
    return acc;
  }, {} as Record<string, Spool[]>);

  if (spoolsLoading) {
    return (
      <div className="loading-container">
        <Spin size="large" />
      </div>
    );
  }

  return (
    <div className="modern-dashboard">
      {/* Header */}
      <div className="dashboard-header">
        <Title level={3} className="dashboard-title">
          Mi Inventario 🧪
        </Title>
        <Text type="secondary">
          {totalWeight > 0 ? `${(totalWeight / 1000).toFixed(1)}kg disponible` : "Sin stock"}
        </Text>
      </div>

      {/* Stats */}
      <Row gutter={[12, 12]} className="stats-row">
        <Col span={8}>
          <StatCard 
            title="Bobinas" 
            value={spools.length} 
            icon={<DatabaseOutlined />}
            color="#1890ff"
            onClick={() => navigate("/spool")}
          />
        </Col>
        <Col span={8}>
          <StatCard 
            title="Filamentos" 
            value={filaments.length} 
            icon={<ExperimentOutlined />}
            color="#52c41a"
            onClick={() => navigate("/filament")}
          />
        </Col>
        <Col span={8}>
          <StatCard 
            title="Marcas" 
            value={vendors.length} 
            icon={<ShopOutlined />}
            color="#722ed1"
            onClick={() => navigate("/vendor")}
          />
        </Col>
      </Row>

      {/* Low stock alert */}
      {lowStockSpools.length > 0 && (
        <Card className="alert-card">
          <Text type="warning">
            ⚠️ {lowStockSpools.length} bobina(s) con stock bajo (&lt;20%)
          </Text>
        </Card>
      )}

      {/* Spools by material */}
      {spools.length > 0 ? (
        <div className="spools-section">
          {Object.entries(spoolsByMaterial).map(([material, materialSpools]: [string, Spool[]]) => (
            <div key={material} className="material-group">
              <div className="material-header">
                <Tag color="blue">{material}</Tag>
                <Text type="secondary">{materialSpools.length} bobinas</Text>
              </div>
              {materialSpools.map((spool: Spool) => (
                <SpoolCard key={spool.id} spool={spool} />
              ))}
            </div>
          ))}
        </div>
      ) : (
        <Empty 
          description="No hay bobinas todavía"
          className="empty-state"
        >
          <Card 
            className="add-card"
            onClick={() => navigate("/spool/create")}
          >
            <PlusOutlined style={{ fontSize: 24, marginBottom: 8 }} />
            <Text>Añadir primera bobina</Text>
          </Card>
        </Empty>
      )}

      {/* Quick add button */}
      <div 
        className="fab-button"
        onClick={() => navigate("/spool/create")}
      >
        <PlusOutlined style={{ fontSize: 24, color: "white" }} />
      </div>
    </div>
  );
};

export default ModernDashboard;
