import React, { useState, useEffect } from "react";
import { useNavigate, useParams } from "react-router-dom";
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
      navigate("/templates");
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
        <button
          onClick={() => navigate("/templates")}
          style={{
            background: "none",
            border: "none",
            color: "var(--secondary)",
            cursor: "pointer",
          }}
        >
          <ArrowLeft size={24} />
        </button>
        <div>
          <h1 style={{ fontSize: "1.75rem", fontWeight: 700 }}>
            Edit Template
          </h1>
          <p style={{ color: "var(--secondary)" }}>
            Modify your existing message template.
          </p>
        </div>
      </div>

      <div
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
                onClick={() => navigate("/templates")}
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
              Preview
            </h3>
            <div
              style={{
                padding: "1rem",
                backgroundColor: "white",
                borderRadius: "0.5rem",
                border: "1px solid var(--border)",
                minHeight: "100px",
                fontSize: "0.875rem",
                whiteSpace: "pre-wrap",
              }}
            >
              {formData.templateContent ||
                "Your message preview will appear here..."}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
