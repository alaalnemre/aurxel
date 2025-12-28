export default function PublicLayout({
    children,
}: {
    children: React.ReactNode;
}) {
    return (
        <div className="min-h-screen bg-gradient-to-br from-primary-50 to-primary-100">
            {children}
        </div>
    );
}
