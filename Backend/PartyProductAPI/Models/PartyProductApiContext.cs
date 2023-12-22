using System;
using System.Collections.Generic;
using Microsoft.EntityFrameworkCore;

namespace PartyProductAPI.Models;

public partial class PartyProductApiContext : DbContext
{
    public PartyProductApiContext()
    {
    }

    public PartyProductApiContext(DbContextOptions<PartyProductApiContext> options)
        : base(options)
    {
    }

    public virtual DbSet<AssignParty> AssignParties { get; set; }

    public virtual DbSet<Invoice> Invoices { get; set; }

    public virtual DbSet<Party> Parties { get; set; }

    public virtual DbSet<Product> Products { get; set; }

    public virtual DbSet<ProductRate> ProductRates { get; set; }

    public virtual DbSet<TempInvoice> TempInvoices { get; set; }

    protected override void OnConfiguring(DbContextOptionsBuilder optionsBuilder)
#warning To protect potentially sensitive information in your connection string, you should move it out of source code. You can avoid scaffolding the connection string by using the Name= syntax to read it from configuration - see https://go.microsoft.com/fwlink/?linkid=2131148. For more guidance on storing connection strings, see https://go.microsoft.com/fwlink/?LinkId=723263.
        => optionsBuilder.UseSqlServer("Data Source=DESKTOP-T0PIKUK; Initial Catalog=PartyProductApi;Trusted_Connection=True;MultipleActiveResultSets=true;TrustServerCertificate=True");

    protected override void OnModelCreating(ModelBuilder modelBuilder)
    {
        modelBuilder.Entity<AssignParty>(entity =>
        {
            entity.HasKey(e => e.AssignId);

            entity.ToTable("Assign_Party");

            entity.HasIndex(e => new { e.PartyId, e.ProductId }, "IX_Assign_Party").IsUnique();

            entity.Property(e => e.AssignId).HasColumnName("Assign_id");
            entity.Property(e => e.PartyId).HasColumnName("Party_id");
            entity.Property(e => e.ProductId).HasColumnName("Product_id");

            entity.HasOne(d => d.Party).WithMany(p => p.AssignParties)
                .HasForeignKey(d => d.PartyId)
                .HasConstraintName("FK_Assign_Party_Party");

            entity.HasOne(d => d.Product).WithMany(p => p.AssignParties)
                .HasForeignKey(d => d.ProductId)
                .HasConstraintName("FK_Assign_Party_Product");
        });

        modelBuilder.Entity<Invoice>(entity =>
        {
            entity.ToTable("Invoice");

            entity.HasIndex(e => e.InvoiceId, "IX_Invoice_1");

            entity.Property(e => e.Date).HasColumnType("datetime");
            entity.Property(e => e.Rate).HasColumnType("decimal(18, 0)");
            entity.Property(e => e.Total)
                .HasComputedColumnSql("([Rate]*[Quantity])", false)
                .HasColumnType("decimal(29, 0)");

            entity.HasOne(d => d.Party).WithMany(p => p.Invoices)
                .HasForeignKey(d => d.PartyId)
                .OnDelete(DeleteBehavior.ClientSetNull)
                .HasConstraintName("FK_Invoice_Party");

            entity.HasOne(d => d.Product).WithMany(p => p.Invoices)
                .HasForeignKey(d => d.ProductId)
                .OnDelete(DeleteBehavior.ClientSetNull)
                .HasConstraintName("FK_Invoice_Product");
        });

        modelBuilder.Entity<Party>(entity =>
        {
            entity.ToTable("Party");

            entity.HasIndex(e => e.PartyName, "IX_Party_1").IsUnique();

            entity.Property(e => e.PartyId).HasColumnName("Party_id");
            entity.Property(e => e.PartyName)
                .HasMaxLength(50)
                .HasColumnName("Party_Name");
        });

        modelBuilder.Entity<Product>(entity =>
        {
            entity.ToTable("Product");

            entity.HasIndex(e => e.ProductName, "IX_Product").IsUnique();

            entity.Property(e => e.ProductId).HasColumnName("Product_id");
            entity.Property(e => e.ProductName)
                .HasMaxLength(50)
                .HasColumnName("Product_Name");
        });

        modelBuilder.Entity<ProductRate>(entity =>
        {
            entity.HasKey(e => e.RateId);

            entity.ToTable("Product_Rate");

            entity.HasIndex(e => new { e.ProductId, e.Rate, e.RateDate }, "IX_Product_Rate").IsUnique();

            entity.Property(e => e.RateId).HasColumnName("Rate_id");
            entity.Property(e => e.ProductId).HasColumnName("Product_id");
            entity.Property(e => e.Rate).HasColumnType("decimal(18, 0)");
            entity.Property(e => e.RateDate).HasColumnName("Rate_Date");

            entity.HasOne(d => d.Product).WithMany(p => p.ProductRates)
                .HasForeignKey(d => d.ProductId)
                .HasConstraintName("FK_Product_Rate_Product1");
        });

        modelBuilder.Entity<TempInvoice>(entity =>
        {
            entity
                .HasNoKey()
                .ToTable("TempInvoice");

            entity.Property(e => e.InvoiceId)
                .ValueGeneratedOnAdd()
                .HasColumnType("decimal(18, 0)")
                .HasColumnName("Invoice_id");
            entity.Property(e => e.PartyName)
                .HasMaxLength(50)
                .IsUnicode(false)
                .HasColumnName("Party_Name");
            entity.Property(e => e.ProductName)
                .HasMaxLength(50)
                .IsUnicode(false)
                .HasColumnName("Product_Name");
            entity.Property(e => e.Quantity).HasColumnType("decimal(18, 0)");
            entity.Property(e => e.Rate).HasColumnType("decimal(18, 0)");
            entity.Property(e => e.Total)
                .HasComputedColumnSql("([Rate]*[Quantity])", false)
                .HasColumnType("decimal(37, 0)");
        });

        OnModelCreatingPartial(modelBuilder);
    }

    partial void OnModelCreatingPartial(ModelBuilder modelBuilder);
}
