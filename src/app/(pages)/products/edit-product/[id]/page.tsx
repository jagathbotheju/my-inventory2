import EditProduct from "@/components/products/EditProduct";

interface Props {
  params: {
    id: string;
  };
}

const EditProductPage = async ({ params }: Props) => {
  const { id } = await params;
  return (
    <div className="flex flex-col gap-10 w-full">
      <EditProduct productId={id} />
    </div>
  );
};
export default EditProductPage;
