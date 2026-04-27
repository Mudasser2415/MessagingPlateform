import React from "react";
import { useNavigate } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import { FileText, Plus, Search, MoreVertical, Edit } from "lucide-react";
import { Button } from "../components/Button";
import { templateService } from "../services/templateService";
import { useAuthStore } from "../store/authStore";

export const TemplatesPage: React.FC = () => {
  const navigate = useNavigate();
  const { user, selectedClientId } = useAuthStore();

  const { data: templates, isLoading } = useQuery({
    queryKey: ["templates"],
    queryFn: templateService.getTemplates,
  });

  const visibleTemplates = (templates || []).filter((template: any) =>
    user?.role === "Employee" && selectedClientId
      ? template.clientId === selectedClientId
      : true,
  );

  return (
    <div className="animate-fade-in">
      <div
        style={{
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          marginBottom: "2rem",
        }}
      >
        <div>
          <h1 style={{ fontSize: "1.75rem", fontWeight: 700 }}>
            Message Templates
          </h1>
          <p style={{ color: "var(--secondary)" }}>
            Manage your reusable message content and configurations.
          </p>
        </div>
        <Button
          onClick={() => navigate("/templates/new")}
          style={{
            width: "auto",
            paddingLeft: "1.5rem",
            paddingRight: "1.5rem",
          }}
        >
          <Plus size={18} /> Add Template
        </Button>
      </div>

      <div className="stat-card" style={{ padding: 0, overflow: "hidden" }}>
        <div
          style={{
            padding: "1rem 1.5rem",
            borderBottom: "1px solid var(--border)",
            display: "flex",
            alignItems: "center",
            gap: "1rem",
          }}
        >
          <div style={{ position: "relative", flex: 1 }}>
            <Search
              size={18}
              style={{
                position: "absolute",
                left: "0.75rem",
                top: "50%",
                transform: "translateY(-50%)",
                color: "var(--secondary)",
              }}
            />
            <input
              type="text"
              placeholder="Search templates..."
              className="form-input"
              style={{ paddingLeft: "2.5rem", marginBottom: 0 }}
            />
          </div>
        </div>

        {isLoading ? (
          <div
            style={{
              padding: "4rem",
              textAlign: "center",
              color: "var(--secondary)",
            }}
          >
            <p>Loading templates...</p>
          </div>
        ) : user?.role === "Employee" && !selectedClientId ? (
          <div style={{ padding: "6rem 4rem", textAlign: "center" }}>
            <h3
              style={{
                fontSize: "1.125rem",
                fontWeight: 600,
                marginBottom: "0.5rem",
              }}
            >
              Select a client first
            </h3>
            <p style={{ color: "var(--secondary)" }}>
              Use the header selector to choose which assigned client you want
              to manage.
            </p>
          </div>
        ) : visibleTemplates.length === 0 ? (
          <div style={{ padding: "6rem 4rem", textAlign: "center" }}>
            <div
              style={{
                width: "64px",
                height: "64px",
                backgroundColor: "var(--background)",
                borderRadius: "50%",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                margin: "0 auto 1.5rem",
                color: "var(--secondary)",
              }}
            >
              <FileText size={32} />
            </div>
            <h3
              style={{
                fontSize: "1.125rem",
                fontWeight: 600,
                marginBottom: "0.5rem",
              }}
            >
              No templates found
            </h3>
            <p style={{ color: "var(--secondary)", marginBottom: "1.5rem" }}>
              Get started by creating your first message template.
            </p>
            <Button
              variant="outline"
              onClick={() => navigate("/templates/new")}
              style={{ width: "auto" }}
            >
              Create First Template
            </Button>
          </div>
        ) : (
          <table style={{ width: "100%", borderCollapse: "collapse" }}>
            <thead>
              <tr
                style={{
                  textAlign: "left",
                  backgroundColor: "#fcfcfc",
                  borderBottom: "1px solid var(--border)",
                }}
              >
                <th
                  style={{
                    padding: "1rem 1.5rem",
                    fontSize: "0.75rem",
                    fontWeight: 600,
                    textTransform: "uppercase",
                    color: "var(--secondary)",
                  }}
                >
                  Template Name
                </th>
                <th
                  style={{
                    padding: "1rem 1.5rem",
                    fontSize: "0.75rem",
                    fontWeight: 600,
                    textTransform: "uppercase",
                    color: "var(--secondary)",
                  }}
                >
                  Category
                </th>
                <th
                  style={{
                    padding: "1rem 1.5rem",
                    fontSize: "0.75rem",
                    fontWeight: 600,
                    textTransform: "uppercase",
                    color: "var(--secondary)",
                  }}
                >
                  Type
                </th>
                <th
                  style={{
                    padding: "1rem 1.5rem",
                    fontSize: "0.75rem",
                    fontWeight: 600,
                    textTransform: "uppercase",
                    color: "var(--secondary)",
                  }}
                >
                  Created At
                </th>
                <th style={{ padding: "1rem 1.5rem" }}></th>
              </tr>
            </thead>
            <tbody>
              {visibleTemplates.map((template: any) => (
                <tr
                  key={template.templateId}
                  style={{ borderBottom: "1px solid var(--border)" }}
                >
                  <td style={{ padding: "1rem 1.5rem" }}>
                    <div style={{ fontWeight: 600 }}>
                      {template.templateName}
                    </div>
                    <div
                      style={{
                        fontSize: "0.75rem",
                        color: "var(--secondary)",
                        maxWidth: "300px",
                        overflow: "hidden",
                        textOverflow: "ellipsis",
                        whiteSpace: "nowrap",
                      }}
                    >
                      {template.templateContent}
                    </div>
                  </td>
                  <td style={{ padding: "1rem 1.5rem" }}>
                    <span
                      style={{
                        padding: "0.25rem 0.625rem",
                        borderRadius: "1rem",
                        fontSize: "0.75rem",
                        fontWeight: 600,
                        backgroundColor: "rgba(99, 102, 241, 0.1)",
                        color: "var(--primary)",
                      }}
                    >
                      {template.category}
                    </span>
                  </td>
                  <td style={{ padding: "1rem 1.5rem", fontSize: "0.875rem" }}>
                    {template.templateType}
                  </td>
                  <td
                    style={{
                      padding: "1rem 1.5rem",
                      fontSize: "0.875rem",
                      color: "var(--secondary)",
                    }}
                  >
                    {new Date(template.createdAt).toLocaleDateString()}
                  </td>
                  <td
                    style={{
                      padding: "1rem 1.5rem",
                      textAlign: "right",
                      display: "flex",
                      gap: "0.5rem",
                      justifyContent: "flex-end",
                    }}
                  >
                    <button
                      onClick={() =>
                        navigate(`/templates/edit/${template.templateId}`)
                      }
                      style={{
                        background: "none",
                        border: "none",
                        color: "var(--primary)",
                        cursor: "pointer",
                      }}
                      title="Edit Template"
                    >
                      <Edit size={18} />
                    </button>
                    <button
                      style={{
                        background: "none",
                        border: "none",
                        color: "var(--secondary)",
                        cursor: "pointer",
                      }}
                    >
                      <MoreVertical size={18} />
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </div>
  );
};
