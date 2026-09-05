import React, { useState, useEffect } from "react";
import { useLocation, useNavigate, useParams } from "react-router-dom";
import { Save, ArrowLeft, Info } from "lucide-react";
import { Input } from "../components/Input";
import { Select } from "../components/Select";
import { Textarea } from "../components/Textarea";
import { Button } from "../components/Button";
import {
  templateCategories,
  templateTypes,
} from "../constants/templateOptions";
import { templateService } from "../services/templateService";

export const EditTemplatePage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const [formData, setFormData] = useState({
    templateName: "",
    templateContent: "",
    category: "",
    templateType: "",
  });
  const [isLoading, setIsLoading] = useState(false);
  const [isFetching, setIsFetching] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const navigate = useNavigate();
  const location = useLocation();
  const templateListPath = location.pathname.startsWith("/admin/")
    ? "/admin/templates"
    : "/templates";

  useEffect(() => {
    const fetchTemplate = async () => {
      if (!id) return;
      try {
        const data = await templateService.getTemplateById(id);
        setFormData({
          templateName: data.templateName,
          templateContent: data.templateContent,
          category: data.category,
          templateType: data.templateType,
        });
      } catch (err) {
        setError("Failed to fetch template details.");
      } finally {
        setIsFetching(false);
      }
    };

    fetchTemplate();
  }, [id]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!id) return;

    setIsLoading(true);
    setError(null);

    try {
      await templateService.updateTemplate(id, {
        templateId: id,
        ...formData,
      });
      navigate(templateListPath);
    } catch (err: any) {
      if (err?.response?.data?.errors) {
        const errorMessages = Object.values(err.response.data.errors)
          .flat()
          .join(", ");
        setError(errorMessages);
      } else {
        setError(
          err?.response?.data?.message ||
            "Failed to update template. Please try again.",
        );
      }
    } finally {
      setIsLoading(false);
    }
  };

  const handleChange = (
    e: React.ChangeEvent<
      HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement
    >,
  ) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  if (isFetching) {
    return (
      <div
        style={{
          display: "flex",
          justifyContent: "center",
          alignItems: "center",
          height: "100%",
        }}
      >
        <p>Loading template details...</p>
      </div>
    );
  }

  return (
    <div className="animate-fade-in">
      <div
        style={{
          display: "flex",
          alignItems: "center",
          gap: "1rem",
          marginBottom: "2rem",
        }}
      >
        {/* <button
          onClick={() => navigate(templateListPath)}
          style={{
            background: "none",
            border: "none",
            color: "var(--secondary)",
            cursor: "pointer",
          }}
        >
          <ArrowLeft size={24} />
        </button> */}
        {/* <div>
          <h1 style={{ fontSize: "1.75rem", fontWeight: 700 }}>
            Edit Template
          </h1>
          <p style={{ color: "var(--secondary)" }}>
            Modify your existing message template.
          </p>
        </div> */}
      </div>

      <div
        className="stack-mobile"
        style={{
          display: "grid",
          gridTemplateColumns: "1fr 350px",
          gap: "2rem",
        }}
      >
        <div className="stat-card">
          <form onSubmit={handleSubmit}>
            <Input
              label="Template Name"
              name="templateName"
              placeholder="e.g., Welcome Message"
              value={formData.templateName}
              onChange={handleChange}
              required
            />

            <div
              className="stack-mobile"
              style={{
                display: "grid",
                gridTemplateColumns: "1fr 1fr",
                gap: "1.5rem",
              }}
            >
              <Select
                label="Category"
                name="category"
                options={templateCategories}
                value={formData.category}
                onChange={handleChange}
                required
              />
              <Select
                label="Template Type"
                name="templateType"
                options={templateTypes}
                value={formData.templateType}
                onChange={handleChange}
                required
              />
            </div>

            <Textarea
              label="Template Content"
              name="templateContent"
              placeholder="Enter your message content here... Use {{name}} for variables."
              value={formData.templateContent}
              onChange={handleChange}
              required
            />

            {error && (
              <div
                style={{
                  backgroundColor: "#fee2e2",
                  color: "#b91c1c",
                  padding: "1rem",
                  borderRadius: "0.5rem",
                  marginBottom: "1.5rem",
                  fontSize: "0.875rem",
                }}
              >
                {error}
              </div>
            )}

            <div
              style={{
                display: "flex",
                justifyContent: "flex-end",
                gap: "1rem",
                marginTop: "1rem",
              }}
            >
              <Button
                type="button"
                variant="outline"
                onClick={() => navigate(templateListPath)}
                style={{ width: "auto" }}
              >
                Cancel
              </Button>
              <Button
                type="submit"
                isLoading={isLoading}
                style={{
                  width: "auto",
                  paddingLeft: "2rem",
                  paddingRight: "2rem",
                }}
              >
                <Save size={18} /> Update Template
              </Button>
            </div>
          </form>
        </div>

        <div>
          <div className="stat-card" style={{ marginBottom: "1.5rem" }}>
            <h3
              style={{
                fontSize: "1.125rem",
                fontWeight: 600,
                marginBottom: "1rem",
                display: "flex",
                alignItems: "center",
                gap: "0.5rem",
              }}
            >
              <Info size={18} color="var(--primary)" />
              Guidelines
            </h3>
            <ul
              style={{
                fontSize: "0.875rem",
                color: "var(--secondary)",
                paddingLeft: "1.25rem",
                display: "flex",
                flexDirection: "column",
                gap: "0.75rem",
              }}
            >
              <li>
                Use <strong>&#123;&#123;variable&#125;&#125;</strong> to include
                dynamic content.
              </li>
              <li>Templates must follow the selected category guidelines.</li>
              <li>Marketing templates require opt-out links.</li>
            </ul>
          </div>

          <div
            className="stat-card"
            style={{ backgroundColor: "#fcfcfc", borderStyle: "dashed" }}
          >
            <h3
              style={{
                fontSize: "1.125rem",
                fontWeight: 600,
                marginBottom: "1rem",
              }}
            >
              Mobile Preview
            </h3>

            {/* Mobile Phone Frame */}
            <div
              style={{
                backgroundColor: "#000",
                borderRadius: "2.5rem",
                padding: "0.75rem",
                boxShadow: "0 20px 60px rgba(0, 0, 0, 0.3)",
                maxWidth: "280px",
                margin: "0 auto",
              }}
            >
              {/* Phone Screen */}
              <div
                style={{
                  backgroundColor: "#f5f5f5",
                  borderRadius: "2rem",
                  overflow: "hidden",
                  boxShadow: "inset 0 0 0 1px rgba(0, 0, 0, 0.1)",
                }}
              >
                {/* Status Bar */}
                <div
                  style={{
                    backgroundColor: "#1a7f7e",
                    color: "white",
                    padding: "0.5rem 1rem",
                    fontSize: "0.75rem",
                    display: "flex",
                    justifyContent: "space-between",
                    alignItems: "center",
                  }}
                >
                  <span>12:14</span>
                  <div style={{ display: "flex", gap: "0.25rem" }}>
                    <span>📶</span>
                    <span>📡</span>
                    <span>🔋</span>
                  </div>
                </div>

                {/* Header */}
                <div
                  style={{
                    backgroundColor: "#1a7f7e",
                    color: "white",
                    padding: "0.75rem 1rem",
                    display: "flex",
                    alignItems: "center",
                    gap: "0.75rem",
                    fontSize: "0.875rem",
                    borderBottom: "1px solid #15686a",
                  }}
                >
                  <span style={{ fontSize: "1.25rem" }}>←</span>
                  <div style={{ flex: 1 }}>
                    <div style={{ fontWeight: 600, fontSize: "0.875rem" }}>
                      {formData.templateName || "Contact Name"}
                    </div>
                    <div style={{ fontSize: "0.7rem", opacity: 0.8 }}>
                      +1 234 567 8900
                    </div>
                  </div>
                  <span style={{ fontSize: "1rem" }}>⋮</span>
                </div>

                {/* Chat Area */}
                <div
                  style={{
                    backgroundColor: "#e8d5c4",
                    padding: "1rem",
                    minHeight: "280px",
                    display: "flex",
                    flexDirection: "column",
                    justifyContent: "flex-start",
                    fontSize: "0.8rem",
                  }}
                >
                  <div style={{ marginBottom: "1rem" }}>
                    <div
                      style={{
                        display: "text",
                        marginBottom: "0.25rem",
                        fontSize: "0.65rem",
                        color: "#666",
                        textAlign: "center",
                      }}
                    >
                      Today
                    </div>
                  </div>

                  {/* Message Bubble */}
                  {formData.templateContent && (
                    <div
                      style={{
                        backgroundColor: "#ffffff",
                        color: "#000",
                        padding: "0.75rem 1rem",
                        borderRadius: "1rem",
                        borderBottomLeftRadius: "0.25rem",
                        maxWidth: "85%",
                        wordWrap: "break-word",
                        boxShadow: "0 1px 2px rgba(0, 0, 0, 0.1)",
                      }}
                    >
                      <div
                        style={{ whiteSpace: "pre-wrap", lineHeight: "1.4" }}
                      >
                        {formData.templateContent}
                      </div>
                      <div
                        style={{
                          fontSize: "0.65rem",
                          color: "#999",
                          marginTop: "0.5rem",
                          textAlign: "right",
                        }}
                      >
                        12:14 AM
                      </div>
                    </div>
                  )}
                </div>

                {/* Input Area */}
                <div
                  style={{
                    backgroundColor: "#ffffff",
                    padding: "0.75rem",
                    display: "flex",
                    gap: "0.5rem",
                    alignItems: "center",
                    borderTop: "1px solid #ddd",
                  }}
                >
                  <div
                    style={{
                      flex: 1,
                      backgroundColor: "#f0f0f0",
                      borderRadius: "1.5rem",
                      padding: "0.5rem 1rem",
                      fontSize: "0.75rem",
                      color: "#999",
                    }}
                  >
                    Message
                  </div>
                  <div
                    style={{
                      width: "2rem",
                      height: "2rem",
                      borderRadius: "50%",
                      backgroundColor: "#1a7f7e",
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                      color: "white",
                      fontSize: "1rem",
                      cursor: "pointer",
                    }}
                  >
                    ➤
                  </div>
                </div>
              </div>
            </div>

            <p
              style={{
                fontSize: "0.75rem",
                color: "#999",
                marginTop: "1rem",
                textAlign: "center",
              }}
            >
              Variables will be replaced with real customer data when sent
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};
