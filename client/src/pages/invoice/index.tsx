import { useState } from "react";
import { useCreate, useUpdate, useList } from "@refinedev/core";
import { 
  Card, 
  Input, 
  Button, 
  Typography, 
  Alert, 
  List, 
  Tag, 
  Space,
  message,
  Divider,
  Modal,
  Form,
  InputNumber,
  Select,
  Upload,
  Tabs
} from "antd";
import type { UploadFile } from "antd";
import { 
  FileTextOutlined, 
  CheckCircleOutlined,
  WarningOutlined,
  EuroOutlined,
  PlusOutlined,
  ShoppingCartOutlined,
  UploadOutlined,
  FilePdfOutlined
} from "@ant-design/icons";
import { useNavigate } from "react-router";

const { Title, Text, Paragraph } = Typography;
const { TextArea } = Input;

interface ParsedFilament {
  sku: string;
  article_number: string;
  material: string;
  color: string;
  variant_code: string;
  price: number;
  weight: number;
}

interface Filament {
  id: number;
  name: string;
  material: string;
  article_number: string;
  price?: number;
  color_hex?: string;
  vendor?: {
    id: number;
    name: string;
  };
}

interface Vendor {
  id: number;
  name: string;
}

// Color mapping for common Bambu Lab colors (English + Spanish)
const COLOR_MAP: Record<string, string> = {
  // English
  'black': '1a1a1a',
  'white': 'ffffff',
  'red': 'e63946',
  'blue': '1890ff',
  'green': '2ecc71',
  'yellow': 'f1c40f',
  'orange': 'ff6b00',
  'gray': '7f8c8d',
  'grey': '7f8c8d',
  'purple': '9b59b6',
  'pink': 'ff69b4',
  'brown': '8b4513',
  'cyan': '00bcd4',
  'magenta': 'ff00ff',
  'lime': '00ff00',
  'navy': '000080',
  'teal': '008080',
  'olive': '808000',
  'maroon': '800000',
  'silver': 'c0c0c0',
  'gold': 'ffd700',
  // Spanish
  'negro': '1a1a1a',
  'blanco': 'ffffff',
  'rojo': 'e63946',
  'azul': '1890ff',
  'verde': '2ecc71',
  'amarillo': 'f1c40f',
  'naranja': 'ff6b00',
  'gris': '7f8c8d',
  'morado': '9b59b6',
  'rosa': 'ff69b4',
  'marrón': '8b4513',
  'marron': '8b4513',
  'chocolate': '8b4513',
  'carbón': '2d2d2d',
  'carbon': '2d2d2d',
  'caramelo': 'd2691e',
  'limón': 'fff44f',
  'limon': 'fff44f',
  'marino': '000080',
  'nardo': 'a9a9a9',
  'oscuro': '4a3728',
};

export const InvoiceImport = () => {
  const navigate = useNavigate();
  const [invoiceText, setInvoiceText] = useState("");
  const [parsedFilaments, setParsedFilaments] = useState<ParsedFilament[]>([]);
  const [parsing, setParsing] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [updated, setUpdated] = useState<string[]>([]);
  const [added, setAdded] = useState<string[]>([]);
  const [pdfFile, setPdfFile] = useState<UploadFile | null>(null);
  const [uploadMethod, setUploadMethod] = useState<"pdf" | "text">("pdf");

  const { result: filamentsResult, query: filamentsQuery } = useList<Filament>({
    resource: "filament",
    pagination: { mode: "off" },
  });
  
  const refetchFilaments = () => filamentsQuery.refetch();

  const { result: vendorsResult } = useList<Vendor>({
    resource: "vendor",
    pagination: { mode: "off" },
  });

  const { mutate: updateFilament } = useUpdate();
  const { mutate: createFilament } = useCreate();
  const { mutate: createSpool } = useCreate();

  const filaments = filamentsResult?.data || [];
  const vendors = vendorsResult?.data || [];

  const parseInvoice = async () => {
    if (!invoiceText.trim()) {
      setError("Please paste invoice text first");
      return;
    }

    setParsing(true);
    setError(null);
    setParsedFilaments([]);
    setUpdated([]);
    setAdded([]);

    try {
      const response = await fetch("/api/v1/invoice/parse", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ text: invoiceText }),
      });

      const data = await response.json();

      if (data.success) {
        setParsedFilaments(data.filaments);
        if (data.filaments.length === 0) {
          setError("No filaments found in the invoice text");
        }
      } else {
        setError(data.message || "Failed to parse invoice");
      }
    } catch (err) {
      setError("Failed to connect to API");
    } finally {
      setParsing(false);
    }
  };

  const parsePDF = async () => {
    if (!pdfFile || !pdfFile.originFileObj) {
      setError("Por favor selecciona un archivo PDF");
      return;
    }

    setParsing(true);
    setError(null);
    setParsedFilaments([]);
    setUpdated([]);
    setAdded([]);

    try {
      const formData = new FormData();
      formData.append("file", pdfFile.originFileObj);

      const response = await fetch("/api/v1/invoice/parse-pdf", {
        method: "POST",
        body: formData,
      });

      const data = await response.json();

      if (data.success) {
        setParsedFilaments(data.filaments);
        message.success(`${data.filaments.length} filamento(s) encontrado(s)`);
        if (data.filaments.length === 0) {
          setError("No se encontraron filamentos en el PDF");
        }
      } else {
        setError(data.message || data.detail || "Error al procesar el PDF");
      }
    } catch (err) {
      setError("Error de conexión con la API");
    } finally {
      setParsing(false);
    }
  };

  const findMatchingFilament = (articleNumber: string): Filament | undefined => {
    return filaments.find(f => f.article_number === articleNumber);
  };

  const applyPrice = (parsed: ParsedFilament) => {
    const matching = findMatchingFilament(parsed.article_number);
    if (!matching) {
      message.warning(`Filament not found: ${parsed.article_number}`);
      return;
    }

    updateFilament(
      {
        resource: "filament",
        id: matching.id,
        values: { price: parsed.price },
      },
      {
        onSuccess: () => {
          message.success(`Price updated: ${matching.name} → €${parsed.price}`);
          setUpdated([...updated, parsed.article_number]);
          refetchFilaments();
        },
        onError: () => {
          message.error("Failed to update price");
        },
      }
    );
  };

  // Add filament directly without modal - marks as pending verification
  const addFilamentDirect = (parsed: ParsedFilament) => {
    // Find Bambu Lab vendor or first vendor
    const bambuVendor = vendors.find(v => v.name.toLowerCase().includes('bambu'));
    const defaultVendor = bambuVendor || vendors[0];
    
    const colorHex = getColorHex(parsed.color);
    const materialBase = parsed.material.split(' ')[0]; // "PLA" from "PLA BASIC"
    
    // Create filament
    createFilament(
      {
        resource: "filament",
        values: {
          name: `${parsed.material} ${parsed.color}`,
          material: materialBase,
          color_hex: colorHex,
          price: parsed.price,
          weight: parsed.weight,
          density: 1.24,
          diameter: 1.75,
          article_number: parsed.article_number,
          vendor_id: defaultVendor?.id,
        },
      },
      {
        onSuccess: (data) => {
          // Create spool marked as pending verification
          createSpool(
            {
              resource: "spool",
              values: {
                filament_id: data.data.id,
                initial_weight: parsed.weight,
                used_weight: 0,
                location: '',
                comment: '[PENDIENTE ESCANEAR]',
                extra: {
                  needs_verification: 'true',
                  source: 'invoice',
                },
              },
            },
            {
              onSuccess: () => {
                message.success(`✓ ${parsed.material} ${parsed.color} añadido`);
                setAdded(prev => [...prev, parsed.article_number]);
                refetchFilaments();
              },
              onError: () => {
                message.error("Error al crear bobina");
              },
            }
          );
        },
        onError: () => {
          message.error("Error al crear filamento");
        },
      }
    );
  };

  // Add all unmatched filaments at once
  const addAllFilaments = () => {
    unmatchedFilaments.forEach((item, index) => {
      // Stagger the requests slightly to avoid race conditions
      setTimeout(() => {
        addFilamentDirect(item);
      }, index * 300);
    });
  };

  const getColorHex = (colorName: string): string => {
    // Normalize and check exact match first
    const normalized = colorName.toLowerCase().trim();
    if (COLOR_MAP[normalized]) {
      return COLOR_MAP[normalized];
    }
    
    // Check each word in the color name
    const words = normalized.split(/\s+/);
    for (const word of words) {
      if (COLOR_MAP[word]) {
        return COLOR_MAP[word];
      }
    }
    
    // Check if any key is contained in the color name
    for (const [key, hex] of Object.entries(COLOR_MAP)) {
      if (normalized.includes(key)) {
        return hex;
      }
    }
    
    return '808080'; // Default gray
  };

  // Separate filaments into matched and unmatched
  // Exclude just-added filaments from both lists (they'll show in success state)
  const matchedFilaments = parsedFilaments.filter(f => 
    findMatchingFilament(f.article_number) && !added.includes(f.article_number)
  );
  const unmatchedFilaments = parsedFilaments.filter(f => 
    !findMatchingFilament(f.article_number) && !added.includes(f.article_number)
  );
  const newlyAdded = parsedFilaments.filter(f => added.includes(f.article_number));
  
  // Check if all filaments from invoice have been added
  const allAdded = parsedFilaments.length > 0 && unmatchedFilaments.length === 0 && matchedFilaments.length === 0;

  return (
    <div style={{ padding: 24, maxWidth: 800, margin: "0 auto" }}>
      <Title level={3}>
        <FileTextOutlined /> Importar Factura
      </Title>
      
      <Paragraph type="secondary">
        Sube un PDF de factura de Bambu Lab o pega el texto para extraer filamentos y precios automáticamente.
      </Paragraph>

      <Card style={{ marginBottom: 24 }}>
        <Tabs
          activeKey={uploadMethod}
          onChange={(key) => setUploadMethod(key as "pdf" | "text")}
          items={[
            {
              key: "pdf",
              label: (
                <span>
                  <FilePdfOutlined /> Subir PDF
                </span>
              ),
              children: (
                <div>
                  <Upload.Dragger
                    accept=".pdf"
                    maxCount={1}
                    fileList={pdfFile ? [pdfFile] : []}
                    beforeUpload={() => false}
                    onChange={(info) => {
                      const file = info.fileList[0] || null;
                      setPdfFile(file);
                      setError(null);
                    }}
                    onRemove={() => {
                      setPdfFile(null);
                    }}
                    style={{ marginBottom: 16 }}
                  >
                    <p className="ant-upload-drag-icon">
                      <FilePdfOutlined style={{ fontSize: 48, color: '#ff4d4f' }} />
                    </p>
                    <p className="ant-upload-text">
                      Arrastra un PDF aquí o haz click para seleccionar
                    </p>
                    <p className="ant-upload-hint">
                      Facturas de store.bambulab.com
                    </p>
                  </Upload.Dragger>
                  
                  <Space>
                    <Button 
                      type="primary" 
                      onClick={parsePDF}
                      loading={parsing}
                      disabled={!pdfFile}
                      icon={<UploadOutlined />}
                    >
                      Procesar PDF
                    </Button>
                    <Button onClick={() => {
                      setPdfFile(null);
                      setParsedFilaments([]);
                      setError(null);
                      setUpdated([]);
                      setAdded([]);
                    }}>
                      Limpiar
                    </Button>
                  </Space>
                </div>
              ),
            },
            {
              key: "text",
              label: (
                <span>
                  <FileTextOutlined /> Pegar Texto
                </span>
              ),
              children: (
                <div>
                  <TextArea
                    rows={8}
                    placeholder="Pega el texto de la factura aquí...&#10;&#10;Ejemplo:&#10;PLA Basic SKU: A00-K0-1.75-1000-SPL Variant: Black (10101) / 1kg ... €10.26"
                    value={invoiceText}
                    onChange={(e) => setInvoiceText(e.target.value)}
                    style={{ marginBottom: 16 }}
                  />
                  
                  <Space>
                    <Button 
                      type="primary" 
                      onClick={parseInvoice}
                      loading={parsing}
                    >
                      Procesar Texto
                    </Button>
                    <Button onClick={() => {
                      setInvoiceText("");
                      setParsedFilaments([]);
                      setError(null);
                      setUpdated([]);
                      setAdded([]);
                    }}>
                      Limpiar
                    </Button>
                  </Space>
                </div>
              ),
            },
          ]}
        />
      </Card>

      {error && (
        <Alert
          message={error}
          type="warning"
          showIcon
          style={{ marginBottom: 24 }}
        />
      )}

      {/* Success state - all filaments added */}
      {allAdded && newlyAdded.length > 0 && (
        <Card 
          style={{ 
            marginBottom: 24, 
            borderColor: '#52c41a',
            textAlign: 'center',
            padding: '24px 0'
          }}
        >
          <CheckCircleOutlined style={{ fontSize: 48, color: '#52c41a', marginBottom: 16 }} />
          <Title level={4} style={{ margin: '0 0 8px 0' }}>
            ✅ {newlyAdded.length} filamento(s) añadido(s)
          </Title>
          <Paragraph type="secondary" style={{ marginBottom: 16 }}>
            Aparecerán como "pendientes de escanear" en el dashboard.
            <br />
            Cuando lleguen, escanéalos con BambuMan para verificarlos.
          </Paragraph>
          <Space>
            <Button 
              type="primary" 
              size="large"
              onClick={() => navigate('/')}
            >
              Ver Dashboard
            </Button>
            <Button 
              onClick={() => {
                setParsedFilaments([]);
                setAdded([]);
                setPdfFile(null);
                setInvoiceText('');
              }}
            >
              Importar otra factura
            </Button>
          </Space>
        </Card>
      )}

      {/* Purchased but not in inventory - Compact view */}
      {unmatchedFilaments.length > 0 && (
        <Card 
          title={`📦 ${unmatchedFilaments.length} nuevo(s) - Pendiente llegada`}
          extra={
            <Button 
              type="primary"
              size="small"
              onClick={addAllFilaments}
            >
              Añadir todos
            </Button>
          }
          style={{ marginBottom: 24, borderColor: '#faad14' }}
          bodyStyle={{ padding: '8px 16px' }}
        >
          {unmatchedFilaments.map((item, idx) => (
            <div 
              key={item.sku}
              style={{ 
                display: 'flex', 
                alignItems: 'center', 
                padding: '8px 0',
                borderBottom: idx < unmatchedFilaments.length - 1 ? '1px solid #303030' : 'none',
                gap: 8
              }}
            >
              {/* Color indicator */}
              <div 
                style={{ 
                  width: 24, 
                  height: 24, 
                  borderRadius: 4,
                  backgroundColor: `#${getColorHex(item.color)}`,
                  border: '1px solid rgba(255,255,255,0.2)',
                  flexShrink: 0
                }} 
              />
              {/* Info */}
              <div style={{ flex: 1, minWidth: 0 }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 4, flexWrap: 'wrap' }}>
                  <Text strong style={{ fontSize: 13 }}>{item.material}</Text>
                  <Text type="secondary" style={{ fontSize: 12 }}>{item.color}</Text>
                </div>
              </div>
              {/* Price */}
              <Text style={{ color: '#52c41a', fontWeight: 500, fontSize: 13 }}>
                €{item.price.toFixed(2)}
              </Text>
              {/* Action */}
              <Button 
                type="primary"
                size="small"
                icon={<PlusOutlined />}
                onClick={() => addFilamentDirect(item)}
              />
            </div>
          ))}
        </Card>
      )}

      {/* Already in inventory - update prices - Compact view */}
      {matchedFilaments.length > 0 && (
        <Card 
          title={`✓ ${matchedFilaments.length} en inventario`}
          extra={
            <Button 
              type="primary"
              size="small"
              onClick={() => {
                matchedFilaments.forEach(f => {
                  if (!updated.includes(f.article_number)) {
                    applyPrice(f);
                  }
                });
              }}
            >
              Actualizar todos
            </Button>
          }
          style={{ marginBottom: 24 }}
          bodyStyle={{ padding: '8px 16px' }}
        >
          {matchedFilaments.map((item, idx) => {
            const isUpdated = updated.includes(item.article_number);
            return (
              <div 
                key={item.sku}
                style={{ 
                  display: 'flex', 
                  alignItems: 'center', 
                  padding: '8px 0',
                  borderBottom: idx < matchedFilaments.length - 1 ? '1px solid #303030' : 'none',
                  gap: 8
                }}
              >
                <div 
                  style={{ 
                    width: 24, 
                    height: 24, 
                    borderRadius: 4,
                    backgroundColor: `#${getColorHex(item.color)}`,
                    border: '1px solid rgba(255,255,255,0.2)',
                    flexShrink: 0
                  }} 
                />
                <div style={{ flex: 1, minWidth: 0 }}>
                  <Text strong style={{ fontSize: 13 }}>{item.material}</Text>
                  <Text type="secondary" style={{ fontSize: 12, marginLeft: 4 }}>{item.color}</Text>
                </div>
                <Text style={{ color: '#52c41a', fontSize: 13 }}>€{item.price.toFixed(2)}</Text>
                {isUpdated ? (
                  <Tag color="green" style={{ margin: 0 }}>✓</Tag>
                ) : (
                  <Button size="small" onClick={() => applyPrice(item)}>
                    Actualizar
                  </Button>
                )}
              </div>
            );
          })}
        </Card>
      )}

      {/* Newly added - Compact view */}
      {newlyAdded.length > 0 && (
        <Card 
          title={`✨ ${newlyAdded.length} añadido(s)`}
          style={{ marginBottom: 24, borderColor: '#1890ff' }}
          bodyStyle={{ padding: '8px 16px' }}
        >
          {newlyAdded.map((item, idx) => (
            <div 
              key={item.sku}
              style={{ 
                display: 'flex', 
                alignItems: 'center', 
                padding: '8px 0',
                borderBottom: idx < newlyAdded.length - 1 ? '1px solid #303030' : 'none',
                gap: 8
              }}
            >
              <div 
                style={{ 
                  width: 24, 
                  height: 24, 
                  borderRadius: 4,
                  backgroundColor: `#${getColorHex(item.color)}`,
                  border: '1px solid rgba(255,255,255,0.2)',
                  flexShrink: 0
                }} 
              />
              <div style={{ flex: 1, minWidth: 0 }}>
                <Text strong style={{ fontSize: 13 }}>{item.material}</Text>
                <Text type="secondary" style={{ fontSize: 12, marginLeft: 4 }}>{item.color}</Text>
              </div>
              <Tag color="blue" style={{ margin: 0 }}>✓ Añadido</Tag>
            </div>
          ))}
        </Card>
      )}

      {/* Note: Filaments are added directly, no modal needed */}
    </div>
  );
};

export default InvoiceImport;
